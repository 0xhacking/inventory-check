export class VideoModal implements ng.IComponentController {
  private dismiss: Function;

  public closeModal() {
    this.dismiss();
  }
}

export class VideoModalComponent implements ng.IComponentOptions {
  public controller = VideoModal;
  public templateUrl = 'modules/core/video/videoModal.tpl.html';
  public bindings = {
    dismiss: '&',
  };
}
