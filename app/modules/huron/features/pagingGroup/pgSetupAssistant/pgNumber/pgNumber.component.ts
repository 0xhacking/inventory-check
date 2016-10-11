import { PagingNumberService, INumber } from './pgNumber.service';

class PagingNumberCtrl implements ng.IComponentController {
  public pagingGroupNumber: string;
  public errorNumberInput: boolean = false;
  public availableNumbers: INumber[] = [];
  private onUpdate: Function;

  /* @ngInject */
  constructor(private PagingNumberService: PagingNumberService,
              private Notification) {
  }

  public selectNumber(number: INumber): void {
    if (number) {
      this.pagingGroupNumber = number.number;
      this.onUpdate({
        number: number,
        isValid: true,
      });
    }
  }

  public fetchNumbers(): void {
    if (this.pagingGroupNumber && this.pagingGroupNumber.length >= 3) {
      let promise = this.PagingNumberService.getNumberSuggestions(this.pagingGroupNumber);
      if (promise) {
        promise.then(
          (data: any) => {
            this.availableNumbers = data;
            this.errorNumberInput = (this.availableNumbers && this.availableNumbers.length === 0);
            this.onUpdate({
              number: {
                number: this.pagingGroupNumber,
              },
              isValid: false,
            });
          }, (response) => {
            this.Notification.errorResponse(response, 'pagingGroup.numberFetchFailure');
          });
      }
    }
  }
}

export class PgNumberComponent implements ng.IComponentOptions {
  public controller = PagingNumberCtrl;
  public templateUrl = 'modules/huron/features/pagingGroup/pgSetupAssistant/pgNumber/pgNumber.html';
  public bindings = {
    onUpdate: '&',
    pagingGroupNumber: '<',
  };
}
