


var QR_CHECK_INTERVAL = 5000;      //ogni quanto richimare il controllo del qr: 5sec
var QR_COUNTDOWN_INTERVAL = 1000;  //ogni quanto aggiornare il countdown del qr: 1sec

//esegue controllo periodico su notifica push
function checkPushConfirmed() {

     var jqxhr = $.ajax({
          url: "/idp/login/livello1e2checkpush", 
          dataType: "json",
          cache: false,
          success: function(data ) {
                    if(data.status != 'WAIT'){
                         
                         window.location.href = "/idp/login/livello1e2postpush";
                    }
               }
          });
     
     window.setTimeout(  function(){ checkPushConfirmed() } , QR_CHECK_INTERVAL);

     //nascondere link
     $("#postPushLink").hide();
}

//esegue controllo periodico su scansione QR
function checkQRScanned(cp) {

     var jqxhr = $.ajax({
          url: "/idp/login/livello1e2checkqrcode", 
          dataType: "json",
          cache: false,
          success: function(data ) {
                    if(data.status == 'OK' || data.statusType == 'SESSION_EXPIRED'){
                         
                         window.location.href = "/idp/login/livello1e2postqrcode";
                    }
               }
          });
     
     window.setTimeout(  function(){ checkQRScanned() } , QR_CHECK_INTERVAL);

     //nascondere link
     $("#postQRLink").hide();
}

//dati i millisecondi, restituisce la stringa leggibile (con minuti e secondi)
function millisToMinutesAndSeconds(millis) {
	var minutes = Math.floor(millis / 60000);
	var seconds = ((millis % 60000) / 1000).toFixed(0);
	//return minutes + "':" + (seconds < 10 ? '0' : '') + seconds + "\"";
     return (seconds == 60 ? (minutes+1) + "':00\"" : minutes + "':" + (seconds < 10 ? "0" : "") + seconds + "\"");
}

//conto alla rovescia per la validita' del QR
function countdownQR(tsScadenzaQR) {
     if( Date.now() >= tsScadenzaQR ){ 
          //$("#qrWrapperImg").html("");     //cancella precedente qr
          $("#qrMsgWrapper").hide();         //nasconde qrMsgWrapper
          $("#qrGeneratorWrapper").show();   //mostra qrGeneratorWrapper
          $("#qrOverlay").show(); 
          $("#qrOverlay span").html("Il QR Code <br/> non è più valido."); 
     } else {
          var msg = " " +millisToMinutesAndSeconds( (tsScadenzaQR - Date.now() ) ) ;
          $("#spanSec").html(msg);
          window.setTimeout( function(){ countdownQR(tsScadenzaQR) }, QR_COUNTDOWN_INTERVAL);
     }
}

function resetStatusHandler(){
	
	$("#statusHandler").html("<div class='col'><br/><br/></div>");
}


function checkUsernameAndPassword() {
     var $un = $("#username");
     var $pwd = $("#password");
     
     var un = $un.val();
     var pwd = $pwd.val();
     
     resetStatusHandler();
     
     if(un==""){
          //username non presente
          $("#username, #usernameIcon").addClass("error");
          $("#usernameError").html("Il campo &egrave; obbligatorio");
          $("#usernameIcon a svg use").attr("xlink:href", "/idp/images/l12/sprite.svg#it-warning");
          return false;
     }else if( 
          ! ( 
               (/^C[A-Z]{1}\d{5}[A-Z]{2}$/i.test(un)) || (/^(?:[A-Z][AEIOU][AEIOUX]|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}(?:[\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\dLMNP-V]|[0L][1-9MNP-V]))[A-Z]$/i.test(un)) || (/^\d{11}$/i.test(un)) || (/^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}/i.test(un))
          )){
               //se lo username non corrisponde a cf, email o nun
          $("#username, #usernameIcon").addClass("error");
          $("#usernameError").html("Formato non valido");
          $("#usernameIcon a svg use").attr("xlink:href", "/idp/images/l12/sprite.svg#it-warning");
          return false;
     }else{
          $("#usernameIcon a svg use").attr("xlink:href", "/idp/images/l12/sprite.svg#it-info-circle");
          $("#username, #usernameIcon").removeClass("error");
          $("#usernameError").html("&nbsp;");
     }

     if(pwd==""){
          $pwd.addClass("error");
          $("#passwordError").html("Il campo &egrave; obbligatorio");
          return false;
     }else{
          $pwd.removeClass("error");
          $("#passwordError").html("&nbsp;");
     }

     return true;
}
