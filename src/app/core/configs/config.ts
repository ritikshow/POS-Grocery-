import { NotifierOptions } from "angular-notifier";

export class Config {
  public static customNotifierOptions: NotifierOptions = {
    position: {
      horizontal: {
        position: "right",
        distance: 12
      },
      vertical: {
        position: "top",
        distance: 12,
        gap: 10
      }
    },
    theme: "material",
    behaviour: {
      autoHide: 10000,
      onClick: "hide",
      onMouseover: "pauseAutoHide",
      showDismissButton: true,
      stacking: 5
    },
    animations: {
      enabled: true,
      show: {
        preset: "slide",
        speed: 300,
        easing: "ease"
      },
      hide: {
        preset: "fade",
        speed: 300,
        easing: "ease",
        offset: 50
      },
      shift: {
        speed: 300,
        easing: "ease"
      },
      overlap: 150
    }
  };

  public static dateConfig = {
    format: "dd/MM/yyyy",
    MonthDateConfig: "MM/dd/yyyy"
  };

  public static booleanNYStrToBool = {
    N: false,
    Y: true
  };

  public static booleanTFStrToBool = {
    f: false,
    t: true
  };

  public static verticalPos = {
    B: "Bottom",
    T: "Top"
  };

  public static horizontalPos = {
    L: "Left",
    R: "Right"
  };

  public static getNYStrToBool(val: string) {
    return this.booleanNYStrToBool[val];
  }

  public static getTFStrToBool(val: string) {
    return this.booleanTFStrToBool[val];
  }

  public static getTFNumToBool(val: any) {
    if (val == "1") {
      return true;
    }
    return false;
  }

  public static getNYboolTostr(val: boolean) {
    if (val) {
      return "Y";
    }
    return "N";
  }

  public static getTFboolTostr(val: boolean) {
    if (val) {
      return "t";
    }
    return "f";
  }

  public static getTFboolToNum(val: boolean) {
    if (val) {
      return "1";
    }
    return "0";
  }

  public static getVerticalPos(val: string) {
    return this.verticalPos[val];
  }

  public static getHorizontalPos(val: string) {
    return this.horizontalPos[val];
  }

  public static getItemsFile = {
    NumberofFiles: 4, //start with 0
    filesize: 50000000 //50 MB
  }

  public static masterfilesheaders = {
    productmaster: ["ARTICLE NO", "TYPE", "DESCRIPTION", "UOM", "PRIMARY PLANT", "INDUSTRY STD TEXT", "LAB TEXT", "HSN CODE", "PG", "PH", "PH TWO", "PH SIX", "SAP ID", "LENGTH"],
    alpmaster: ["ARTICLE NO", "ALP", "MSQ", "VALID FROM", "VALID TO", "STATUS"],
    costmasterstd: ["ARTICLE NO", "PRIMARY PLANT", "CURRENCY", "STANDARD COST", "COPPER WEIGHT", "COPPER INDEX", "BASE PRICE", "COPPER BASE COST", "OTHER RMC", "OVERHEAD"],
    costmastertrd: ["ARTICLE NO", "PRIMARY PLANT", "CURRENCY", "LANDING COST", "COPPER INDEX", "CU BASE", "TRANSFER PRICE"],
    freightmaster: ["ARTICLE NO", "OWF", "ADJ FACTOR ONE", "ADJ FACTOR TWO", "ADJ FACTOR THREE", "ADJ FACTOR FOUR", "ADJ FACTOR FIVE", "ADJ FACTOR SIX"],
    hsnmaster: ["ARTICLE NO", "HSN CODE", "BCD", "FREIGHT AND INSURANCE", "LANDING CHARGES", "CLEARING CHARGES", "IN LAND FREIGHT", "CESS1", "CESS2", "CESS3", "CESS4", "OTHER CHARGES", "FBD"],
    marginmaster: ["PG", "PH", "MAX DISCOUNT", "GROUP MARGIN"],
    importitem: ["SrNo", "ArticleNo", "Qty", "Discount"]
  }

  public static productcatalogue = {
    url: 'https://lappindia.lappgroup.com/products/catalogue.html'
  }
}
