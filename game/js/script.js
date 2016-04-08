

(function (global) {

  var tc = {};

  tc.started = false;
  tc.playing = false;
  tc.character = {
    x: 500,
    y: 500,
    vX: 0,
    vY: 0
  }
  tc.speed = 1.0;
  tc.speedIncrement = 0.0005;
  tc.normalizeSpeed = function() {
    if (tc.character.vX === 0 && tc.character.vY === 0) return;
    var curSpeedSq = tc.character.vX * tc.character.vX + tc.character.vY * tc.character.vY;
    var ratio = Math.sqrt(tc.speed * tc.speed / curSpeedSq);
    tc.character.vX *= ratio;
    tc.character.vY *= ratio;
  }

  tc.rebuildMenuUI = function() {
      console.log("rebuildMenuUI");
      if (tc.started) {
        $("#menu-play").hide();
        if (tc.playing) {
          $("#menu-pause").show();
          $("#menu-stop").hide();
          $("#menu-continue").hide();
        } else {
          $("#menu-pause").hide();
          $("#menu-stop").show();
          $("#menu-continue").show();
        }
      } else {
        //Hide all but start
        $("#menu-play").show();
        $("#menu-pause").hide();
        $("#menu-stop").hide();
        $("#menu-continue").hide();
      }
      var screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        $("#collapsable-nav").collapse('hide');
      }    
  };

  tc.recalcLandscape = function() {
    if (window.innerWidth > window.innerHeight + $("#score-info-box").width() - 60) { //To have extra space for scores etc...
      tc.landscape = true;
    } else {
      tc.landscape = false;
    }
    return tc.landscape;
  }
  tc.landscape = tc.recalcLandscape();

  tc.size = tc.size || 0;
  tc.fieldSize = tc.fieldSize || 0;
  tc.fieldBoxOffsetCoords = tc.fieldBoxOffsetCoords || {left: 0, top: 0};

  tc.bitaX = tc.bitaX || 500;    //Size of bita - 20%; thus allowed coord ranges are 100 to 900
  tc.bitaSize = 200;
  tc.minBitaXAllowed = tc.bitaSize / 2;
  tc.maxBitaXAllowed = 1000 - tc.bitaSize / 2; 
  tc.bita = $("#bita");

  tc.drawBita = function() {
    tc.bita.offset({
      left: tc.fieldBoxOffsetCoords.left + (tc.bitaX - tc.bitaSize / 2) * tc.fieldSize / 1000,
      top: tc.fieldBoxOffsetCoords.top + tc.fieldSize
    });
  }

  tc.updateBita = function(newXCoord) {
    if (newXCoord === undefined) return;
    if (newXCoord < tc.minBitaXAllowed) newXCoord = tc.minBitaXAllowed;
    if (newXCoord > tc.maxBitaXAllowed) newXCoord = tc.maxBitaXAllowed;
    tc.bitaX = newXCoord;
    // console.log("Update bita: " + newXCoord);
    tc.drawBita();
  }

  tc.characterElement = $("#character");
  tc.characterSize = 200;
  tc.minCharacterXAllowed = tc.characterSize / 2;
  tc.maxCharacterXAllowed = 1000 - tc.characterSize / 2; 
  tc.minCharacterYAllowed = tc.characterSize / 2;
  tc.maxCharacterYAllowed = 1000;   
  tc.drawCharacter = function() {
    tc.characterElement.offset({
      left: tc.fieldBoxOffsetCoords.left + (tc.character.x - tc.characterSize / 2) * tc.fieldSize / 1000,
      top: tc.fieldBoxOffsetCoords.top + (tc.character.y - tc.characterSize / 2) * tc.fieldSize / 1000
    });  
  };

  tc.moveCharacter = function(time) {
    tc.character.x += time * tc.character.vX;
    if (tc.character.x < tc.minCharacterXAllowed && tc.character.vX < 0) {
      //Bounce right
      tc.bounced();
      tc.character.x = tc.minCharacterXAllowed;      
      tc.character.vX = -tc.character.vX;
    }
    if (tc.character.x > tc.maxCharacterXAllowed && tc.character.vX > 0) {
      //Bounce left
      tc.bounced();
      tc.character.x = tc.maxCharacterXAllowed;       
      tc.character.vX = -tc.character.vX;
    } 
    tc.character.y += time * tc.character.vY;
    if (tc.character.y < tc.minCharacterYAllowed && tc.character.vY < 0) {
            //Bounce down
      tc.bounced();
      tc.character.y = tc.minCharacterYAllowed;      
      tc.character.vY = -tc.character.vY;

    }
    tc.processOverlap();
    if (tc.character.y > tc.maxCharacterYAllowed && tc.character.vY > 0) {
      //GAME OVER!!!!
      tc.gameOver();
      window.clearInterval(tc.timer);

    }  


    tc.drawCharacter();      
  };


  tc.processOverlap = function() {
    var bottomY = tc.character.y + tc.characterSize / 2;
    var centerY = tc.character.y;
    var centerX = tc.character.x;

    var bitaLeft = tc.bitaX - tc.bitaSize / 2;
    var bitaRight = tc.bitaX + tc.bitaSize / 2;
    var bitaTop = tc.maxCharacterYAllowed;

    // console.log(tc.character);
    // console.log("BL: "+bitaLeft + " BR: "+bitaRight + " BC: "+bitaTop);
    // console.log("BY: "+bottomY + " CY: "+centerY + " CX: "+centerX);

    if (centerY > bitaTop) return;  //Too late... Game over
    if (bottomY < bitaTop) return;  //Not yet reached
    if (character.vY < 0) return; //Already returning
    var bounced = false;
    if (centerX < bitaLeft) {
      if ((centerX - bitaLeft) * (centerX - bitaLeft) + (centerY - bitaTop) * (centerY - bitaTop) <
        tc.characterSize * tc.characterSize / 4) {
          bounced = true;
      }
    } else if (centerX > bitaRight) {
      if ((centerX - bitaRight) * (centerX - bitaRight) + (centerY - bitaTop) * (centerY - bitaTop) <
        tc.characterSize * tc.characterSize / 4) {
          bounced = true;
      }
    } else {
      tc.character.y = bitaTop - tc.characterSize / 2;
      bounced = true;
    }
    if (bounced) {
      tc.bounced();
      tc.bounced();
      tc.bounced();
      tc.character.vY = -tc.character.vY;
      var len = (tc.bitaSize + tc.characterSize) / 2;
      var dV = (centerX - tc.bitaX) / len * tc.speed;
      tc.character.vX += dV;
      tc.normalizeSpeed();
    }

  }

  //Called when char bounced - to add scores
  tc.bounced = function() {
      tc.score += 20;
  }  



  tc.score = 0;

  tc.samplingTime = 50;   //ms

  tc.scoreElement = $("#score");

  tc.updateScore = function() {
    tc.scoreElement.text(tc.score);
  }





  tc.gameOver = function() {
    console.log("Game over!");
    if (tc.started) {
      tc.started = false;
      tc.playing = false;
      tc.rebuildMenuUI();
      $("#gameover-box").show();
      //TODO: you lost notification?
    } else {
      //TODO: other notification?!
    }
  }

  tc.startInterval = function() {
        // window.clearInterval(tc.timer);    
    tc.timer = window.setInterval(function(){
      tc.speed += tc.speedIncrement;
      tc.score++;
      tc.moveCharacter(tc.samplingTime);
      tc.updateScore();
      tc.updateScore();
    }, tc.samplingTime);

  }

  tc.playPressed = function() {
    tc.started=true; 
    tc.playing=true; 
    tc.rebuildMenuUI();
    $("#gameover-box").hide();

    tc.character = {
      x: 500,
      y: 500,
      vX: Math.random(100) - Math.random(100),
      vY: Math.random(100) - Math.random(100)
    };
    if (tc.character.vY > 0) tc.character.vY = -tc.character.vY;
    tc.normalizeSpeed();
    tc.startInterval();
    tc.score = 0;
    tc.updateScore();
  }

  tc.stopPressed = function() {
    tc.started=false; 
    tc.playing=false; 
    tc.rebuildMenuUI();
    tc.gameOver();
    $("#gameover-box").hide();    
  }

  tc.continuePressed = function() {
    tc.started=true; 
    tc.playing=true; 
    tc.rebuildMenuUI();
    tc.startInterval();
  }

  tc.pausePressed = function() {
    tc.started=true; 
    tc.playing=false; 
    tc.rebuildMenuUI();
    window.clearInterval(tc.timer);
  }




  tc.rebuildMenuUI();
  tc.drawBita();
  global.$tc = tc;
//    $("#gameover-box").hide();


})(window);

$(function () { // Same as document.addEventListener("DOMContentLoaded"...
  $("#game-box").mousemove(function(e){
    var pageCoords = "( " + e.pageX + ", " + e.pageY + " )";  
    var clientCoords = "( " + e.clientX + ", " + e.clientY + " )";
    // console.log("Mouse move  " + pageCoords + clientCoords);
    $tc.updateBita(1000 * (e.clientX - $tc.fieldBoxOffsetCoords.left) / ($tc.fieldSize));
    // console.log($tc.bitaX);
  });

  $(window).resize(function (event) {
    // var screenWidth = window.innerWidth;
    // if (screenWidth < 768) {
    //   $("#collapsable-nav").collapse('hide');
    // }
    var elementNav = $("#header-nav");
    var elementGB = $("#game-box");
    var elementSIB = $("#score-info-box");

    var availX = window.innerWidth;
    var availY = window.innerHeight - elementNav.height();
    var widthGB = elementGB.width();
    var heightGB = elementGB.height();
    var sqSize = 0;
    var newCoordsSIB = {};
    var newCoordsGB = {};

    $tc.recalcLandscape();

    //Handle possible landscape change!!!
    if ($tc.landscape) {
      sqSize = Math.min((availX - 28 - (20 + elementSIB.width())), (availY - (40 + 20)));

      var space = (availX - elementSIB.width() - sqSize) / 3;

      newCoordsSIB = { 
         // top: 20 + elementNav.height() + (sqSize - elementSIB.height()) / 2, 
          top: 60 + elementNav.height(), 

          left: (sqSize + space * 2)
      };
      elementSIB.offset(newCoordsSIB);
      newCoordsGB = { 
         top: 20 + elementNav.height(), 
         left: space
      };
      elementGB.offset(newCoordsGB);
    } else {
      sqSize = Math.min((window.innerWidth - 28), (availY - (40 + 20 + 20 + elementSIB.height())));

      newCoordsSIB = { 
         top: 20 + elementNav.height(), 
         left: (availX - elementSIB.width()) / 2
      };
      elementSIB.offset(newCoordsSIB);
      newCoordsGB = { 
         top: 20 + 20 + elementSIB.height() + elementNav.height(), 
         left: (availX - sqSize) / 2
      };
      elementGB.offset(newCoordsGB);

      // console.log(newCoordsGB);
    }

    var elementGO = $("#gameover-box");        
    if (widthGB !== sqSize || heightGB !== sqSize) {
      elementGB.width(sqSize);
      elementGB.height(sqSize);
      var newCoordsGO = {
        left: newCoordsGB.left + sqSize / 2 - elementGO.width() / 2,
        top: newCoordsGB.top + sqSize / 2 - elementGO.height() / 2,

      };
      elementGO.offset(newCoordsGO);        
    }
    var elementFB = $("#field-box");
    if (elementFB.width() !== sqSize * 0.9 || elementFB.height() !== sqSize * 0.9) {
      elementFB.width(sqSize * 0.9);
      elementFB.height(sqSize * 0.9);
      var newCoordsFB = { 
         top: newCoordsGB.top + sqSize * 0.05,  
         left: newCoordsGB.left + sqSize * 0.05
      };
      elementFB.offset(newCoordsFB);
    
    }
    var elementEB = $("#exit-box");
    if (elementEB.width() !== sqSize * 0.9) {
      elementEB.width(sqSize * 0.9);
      elementEB.height(sqSize * 0.05 + 30);
      var newCoordsEB = { 
         top: newCoordsGB.top + sqSize * 0.95 - 30,  
         left: newCoordsGB.left + sqSize * 0.05
      };
      elementEB.offset(newCoordsEB);

    }
    $tc.size = sqSize;
    $tc.fieldSize = sqSize * 0.9;
    $tc.fieldBoxOffsetCoords = newCoordsFB;
    $tc.bita.width($tc.bitaSize / 1000 * $tc.fieldSize);
    $tc.characterElement.width($tc.characterSize / 1000 * $tc.fieldSize);
    $tc.characterElement.height($tc.characterSize / 1000 * $tc.fieldSize);
    $tc.drawBita();
    $tc.drawCharacter();
  });

  $(window).resize();
});


