this.util = {

  symbolSize(n){
    let level = 0;
    if(n >= 5 && n < 20){
      level = 1;
    }
    else if(n >= 20 && n < 50){
      level = 2;
    }
    else if(n >= 50 && n < 100){
      level = 3;
    }
    else if(n >= 100){
      level = 4;
    }

    return [
      2, 4, 8, 13, 20
    ][level];
  }
};