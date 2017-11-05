import { BulkEnableVmService, VoiceMailPayload, Voicemail } from './bulkEnableVm.service';
import { BulkEnableVmError, UsersInfo } from './bulkEnableVm';

const MAXUSERS = 200;
const LIMIT = 4;

export class BulkEnableVmCtrl implements ng.IComponentController {
  public processProgress: number;
  public totalUsersCount: number;
  public usersVoicemailUpdatedCount: number;
  public usersVoicemailFailedCount: number;
  public userVoicemailSkippedCount: number;
  public userErrorArray: BulkEnableVmError[];
  public offset: number;
  public isCancelledByUser: boolean;
  public allUsersEnabled: boolean;
  public scope: Object;
  /* @ngInject */
  constructor(
    private BulkEnableVmService: BulkEnableVmService,
    private UserCsvService,
    private $q: ng.IQService,
  ) {
  }

  public $onInit() {
    this.userErrorArray = [];
    this.usersVoicemailFailedCount = 0;
    this.usersVoicemailUpdatedCount = 0;
    this.userVoicemailSkippedCount = 0;
    this.totalUsersCount = 0;
    this.offset = 0;
    this.isCancelledByUser = false;
    this.processProgress = 0;
    this.allUsersEnabled = false;
    this.enableVoicemailForCustomer();
    this.scope = this;
  }

  public onCancelProcess (): void {
    this.isCancelledByUser = true;
  }

  private logError(userName: string, status: number, errorText: string, trackingID: string): void {
    if (status !== 404) {
        let error = new BulkEnableVmError(userName, status, errorText, trackingID);
        this.userErrorArray.push(error);
        this.UserCsvService.setCsvStat({userErrorArray: [{
                                    row: this.offset,
                                    email: (userName === null ? '' : userName),
                                    error: errorText + (trackingID === null ? '' : trackingID),
                                  }],
        });
        this.usersVoicemailFailedCount++;
      }
    this.processProgress = Math.round(((this.usersVoicemailUpdatedCount +
                           this.usersVoicemailFailedCount + this.userVoicemailSkippedCount) / this.totalUsersCount) * 100);
  }

  private enableVoicemailForCustomer(): void {
    this.processProgress = 0;
    this.userErrorArray = [];
    this.offset = 0;
    this.usersVoicemailFailedCount = 0;
    this.usersVoicemailUpdatedCount = 0;
    this.userVoicemailSkippedCount = 0;
    this.isCancelledByUser = false;
    this.UserCsvService.setCsvStat({userErrorArray: [],
    }, true);

    /* get the total users for the customer */
    this.BulkEnableVmService.getSparkCallUserCountRetry().then(count => {
        this.totalUsersCount = count;
        this.enableVoicemailInLoop();
      },
      () => {
        this.totalUsersCount = MAXUSERS;
        this.enableVoicemailInLoop();
      });
  }

  private enableVoicemailInLoop(): void {
   this.BulkEnableVmService.getUsersRetry(this.offset, LIMIT).then(Users => {
     if (Users.length === 0) {
        this.processProgress = 100;
        return;
     }
     let UsersArray: UsersInfo[] = [];
     for (let i = 0; i < Users.length; i++) {
       let voicemailEnabled = false;
       for (let linkIndex = 0; linkIndex < Users[i].links.length; linkIndex++) {
           if (Users[i].links[linkIndex].rel === 'voicemail') {
             voicemailEnabled = true;
          }
       }
       let userInfo = new UsersInfo(Users[i].uuid, Users[i].userName, voicemailEnabled);
       UsersArray.push(userInfo);
     }
     this.enableVoicemail(UsersArray).then(() => {
       if (this.processProgress === 100 || this.isCancelledByUser) {
          this.processProgress = 100;
          return;
       }
       if (this.offset < this.totalUsersCount) {
          this.enableVoicemailInLoop();
       } else {
         this.processProgress = 100;
       }

     }, () => {
        this.processProgress = 100;
        return;
      });
   },
      (error) => {
        this.logError('failed to fetch users', error.status ? error.status : 500, error.statusText ? error.statusText : null,
          (error.config.headers && error.config.headers.TrackingID) ?
            error.config.headers.TrackingID : null);
        this.processProgress = 100;
        return this.$q.reject();
      });
  }

  private enableVoicemailForOneUser(userId: string, userName: string, voicemailEnabled: boolean): ng.IPromise<any> {
    if (!voicemailEnabled) {
      let userServices = new Array<string>();
      /* find the service list */
      return this.BulkEnableVmService.getUserServicesRetry(userId)
        .then(services => {
            userServices = _.cloneDeep(services);
            if (userServices.indexOf('VOICEMAIL') < 0) {
              userServices.push('VOICEMAIL');
              return this.BulkEnableVmService.getUserSitetoSiteNumberRetry(userId);
            }
            return this.$q.resolve('');
          })
        .then(siteToSiteNumber => {
            if (siteToSiteNumber != null) {
              let voicemail = new Voicemail(siteToSiteNumber);
              let voicemailPayload = new VoiceMailPayload(userServices, voicemail);
              return this.BulkEnableVmService.enableUserVmRetry(userId, voicemailPayload);
            }
            let error = new BulkEnableVmError(userName, 0 , 'No Site to Site Number', null);
            return this.$q.reject(error);
          })
        .then(() => {
            this.usersVoicemailUpdatedCount++;
            this.processProgress = Math.round(((this.usersVoicemailUpdatedCount +
              this.usersVoicemailFailedCount + this.userVoicemailSkippedCount) / this.totalUsersCount) * 100);
          },
          (error) => {
            this.logError(userName, error.status ? error.status : 0,
              error.statusText ? error.statusText : null,
              (error.config && error.config.headers && error.config.headers.TrackingID) ?
                error.config.headers.TrackingID : null);
            return this.$q.resolve();
          });
    } else {
      this.userVoicemailSkippedCount++;
      this.processProgress = Math.round(((this.usersVoicemailUpdatedCount +
        this.usersVoicemailFailedCount + this.userVoicemailSkippedCount) / this.totalUsersCount) * 100);
      return this.$q.resolve();
    }
  }

  private enableVoicemail(Users: UsersInfo[]): ng.IPromise<any> {
    if (Users.length === 0) {
        this.processProgress = 100;
        return this.$q.resolve();
    }
    let i: number;
    let promises: ng.IPromise<any>[] = [];
    for (i = 0; i < Users.length; i++) {
        promises.push(this.enableVoicemailForOneUser(Users[i].uuid, Users[i].userName, Users[i].voicemailEnabled));
        this.offset++;
    }
    return this.$q.all(promises);
   }
}

export class BulkEnableVmComponent implements ng.IComponentOptions {
  public controller = BulkEnableVmCtrl;
  public templateUrl = 'modules/huron/settings/bulkEnableVm/bulkEnableVm.html';
  public bindings = {
    scope: '=',
  };
}
