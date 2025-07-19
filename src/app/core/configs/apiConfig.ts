import { NotifierOptions } from "angular-notifier";

export class Config {

  public static customNotifierOptions: NotifierOptions = {
    position: {
      horizontal: {
        position: 'right',
        distance: 12
      },
      vertical: {
        position: 'top',
        distance: 12,
        gap: 10
      }
    },
    theme: 'material',
    behaviour: {
      autoHide: 5000,
      onClick: 'hide',
      onMouseover: 'pauseAutoHide',
      showDismissButton: true,
      stacking: 4
    },
    animations: {
      enabled: true,
      show: {
        preset: 'slide',
        speed: 300,
        easing: 'ease'
      },
      hide: {
        preset: 'fade',
        speed: 300,
        easing: 'ease',
        offset: 50
      },
      shift: {
        speed: 300,
        easing: 'ease'
      },
      overlap: 150
    }
  };

  public static dateConfig = {
    format: 'dd/MM/yyyy'
  }

  public static booleanNYStrToBool = {
    'N': false,
    'Y': true
  }

  public static booleanTFStrToBool = {
    'f': false,
    't': true
  }

  public static verticalPos = {
    'B': 'Bottom',
    'T': 'Top'
  }

  public static horizontalPos = {
    'L': 'Left',
    'R': 'Right'
  }


  public static getNYStrToBool(val: string) {
    return this.booleanNYStrToBool[val];
  }

  public static getTFStrToBool(val: string) {
    return this.booleanTFStrToBool[val];
  }

  public static getTFNumToBool(val: any) {
    if (val == '1') {
      return true
    }
    return false
  }

  public static getNYboolTostr(val: boolean) {
    if (val) {
      return 'Y';
    }
    return 'N';
  }

  public static getTFboolTostr(val: boolean) {
    if (val) {
      return 't';
    }
    return 'f';
  }

  public static getTFboolToNum(val: boolean) {
    if (val) {
      return '1';
    }
    return '0';
  }

  public static getVerticalPos(val: string) {
    return this.verticalPos[val];
  }

  public static getHorizontalPos(val: string) {
    return this.horizontalPos[val];
  }










}