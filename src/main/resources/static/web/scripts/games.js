//**************************************************************
// Utilidades
var utilidades = (function () {

  var getDatos = function (url) {
    return ($.get(url));
  };

  var postDatos = function (url, data) {

    var urlPost = document.location.origin + url;

    return ($.post({
      url: url,
      data: data
    }));
  };

  var orderByNumberAsc = function (property) {

    return function (o, p) {
      var a, b;
      a = o[property];
      b = p[property];
      return b - a;

    };
  };

  return {
    getDatos: getDatos,
    postDatos: postDatos,
    orderByNumberAsc: orderByNumberAsc
  }

})();

//**************************************************************
// Class info user login
var userInfo = (function () {

  var user = {};

  var setUserId = function (id) {
    user.id = id;
  }

  var setUserName = function (usrName) {
    user.userName = usrName;
  }

  var getUserId = function () {
    return user.id;
  }

  var getUserName = function () {
    return user.userName;
  }

  var totStringUser = function () {
    return user.id + " " + user.userName;
  }

  return {
    setUserId: setUserId,
    getUserId: getUserId,
    setUserName: setUserName,
    getUserName: getUserName,
    totStringUser: totStringUser
  }

})();


//**************************************************************
// Controler Page GAMES
var GamesInfoController = (function () {

  console.log("GamesInfoCtrl --> init");

  var dataTableScore = {
    "row_header": ["Name", "Total", "Won", "Lose", "Tie"]
  };

  var APIurlStrings = {
    apiGames: '/api/games',
    apiLogin: '/api/login',
    apiLogout: '/api/logout',
    apiPlayers: '/api/players',
    apiGame: '/api/game/'
  };

  var DOMStrings = {
    usrLogin: "#usrLogin",
    pwdLogin: "#pwdLogin",
    nameSignUp: "#nameSignUp",
    usrSignUp: "#usrSignUp",
    pwdSignUp: "#pwdSignUp",
    formError: ".formError",
    httpError: ".httpError",
    logoutGames: ".logoutGames",
    loginGames: ".loginGames",
    txtUserLogin: ".txtUserLogin",
    boxUserLogin: ".boxUserLogin",
    modalInfo: "#modalInfo"
  };

  var DOMEventStrings = {

    loginPlayer: '#login_player',
    logout_player: '#logout_player',
    register_player: '#register_player',
    create_game: '#create_game',
    join_game: '.join_game',
    view_game: '.view_game'
  };

  var DOMStyle = {
    errorForm: "#FFA07A"
  }

  //*************************************************************************
  // Return Strings DOM
  var getDOMEventStrings = function () {
    return DOMEventStrings;
  };

  //*************************************************************************
  // Renderizamos LISTA JUDADORES GAMES
  function showListGames(data) {
    renderList(data);
  }

  function getItemHtml(game) {

    var dateCreated = new Date(game.created);
    var fdateCreated = dateCreated.toDateString();
    var dateEjem = moment(dateCreated, 'mm/dd/yyyy');
    var fechaGameCr = dateEjem.format('DD/MM/YYYY, h:mm:ss a');

    //Creamos la lista de los Jugadores -> Games
    var userViewItem = game.gamePlayer.map(getUserView).join("");
    console.log(userViewItem);
    var listUser = game.gamePlayer.map(getItemUser).join(" , ");
    var listShow = game.gamePlayer.map(getBtnView).join(" ");
    var listJoinUsr = getBtnJoin(game.gamePlayer, game.id);

    var liClass = '';
    if (userViewItem === 'OK') {
      liClass = 'list-group-item list-group-item-success list__games-item';
    } else {
      liClass = 'list-group-item list__games-item';
    }

    return "<li class='" + liClass + "'><span class='listIdGame'>" + game.id + "</span>. <span class='listFechaGame'>[" + fechaGameCr + "]</span>" +
        "<span class='listUsersGame'>" + listUser + "</span>" + listShow + " " + listJoinUsr + "</li>";
  }

  function getUserView(gameplayer) {

    if (gameplayer.Player.id === userInfo.getUserId()) {
      return "OK";
    } else {
      return "";
    }
  }

  function getItemUser(gameplayer) {

    if (gameplayer.Player.id === userInfo.getUserId()) {
      return "<span class='itemPlayerUser'>You</span>";
    } else {
      return gameplayer.Player.name;
    }
  }

  function getBtnView(gameplayer) {

    var html = '';
    if (gameplayer.Score != undefined) {
      if (gameplayer.Player.id === userInfo.getUserId()) {
        html = "<span type='button' class='view_game btn btn-info' data-player='" + gameplayer.Player.gpid + "'> View </span>";
      }
    } else {
      if (gameplayer.Player.id === userInfo.getUserId()) {
        html = "<span type='button' class='view_game btn btn-success' data-player='" + gameplayer.Player.gpid + "'> Play </span>";
      }
    }

    return html;
  }

  function getBtnJoin(gameplayers, gameid) {

    var html = '';
    // Cuantos Players tiene el Juego.
    if (gameplayers.length === 1) {
      console.log(gameplayers[0] + ":::" + userInfo.getUserId())
      if (gameplayers[0].Player.id !== userInfo.getUserId()) {
        html = "<span class='join_game btn btn-warning' data-game='" + gameid + "'> Join </span>";
      }
    }
    return html;
  }

  function getListHtml(data) {
    return data.map(getItemHtml).join("");
  }

  function renderList(data) {
    var html = getListHtml(data);
    document.getElementById("listGames").innerHTML = html;
  }

  //*****************************************************************************************
  // Renderizar TABLE SCORE PLAYERS
  function showTableScore(data) {

    if (data != null) {
      var listSort = data.sort(utilidades.orderByNumberAsc("total"));
      renderTable(listSort.filter(scoreValueStat));
    } else {
      console.log("mostrar que aun no hay partidas acabadas.")
    }
  }

  function scoreValueStat(value) {
    return (value.win > 0 || value.lose > 0 || value.tie > 0);
  }

  function getHeadersHtml(data) {
    return "<tr>" + data.row_header.map(getItemHeader).join("") + "</tr>";
  }

  function getItemHeader(th) {
    return "<td>" + th + "</td>"
  }

  function renderHeaders(data) {
    var html = getHeadersHtml(data);
    document.getElementById("table-headers").innerHTML = html;
  }

  function getRowsHtml(data) {
    return data.map(function (row, i) {
      return "<tr>" + getColumnsHtml(row) + "</tr>";
    }).join("");
  }

  function getColumnsHtml(row) {
    var html = '';
    for (var player in row) {
      html += "<td>" + row[player] + "</td>"
    }
    return html;
  }

  function renderRows(data) {
    var html = getRowsHtml(data);
    document.getElementById("table-rows").innerHTML = html;
  }

  function renderTable(data) {
    renderHeaders(dataTableScore);
    renderRows(data);
  }

  //*********************************************************************************
  // Control errores GET/POST
  function showPageError(codError) {

    switch (codError) {
      case "404":
        Location.href = "../public/error/404.html";
        break;
      default:
        break;
    }

  };

  function statusPost(status, txterror, keyerr) {

    switch (status) {
      case 200:
        break;
      case 201:
        break;
      case 401:
        $(DOMStrings[keyerr]).html("Unauthorized if no such user or password doesn't match.");
        break;
      case 403:
        $(DOMStrings[keyerr]).html("Forbidden if username already taken.");
        break;
      case 404:
        break
      default:
        $(DOMStrings[keyerr]).html(txterror);
        break;
    }

  }

  //*********************************************************************************
  // Redirect/show PAGES
  var showPageGame = function (gpid) {

    console.log("showPageGame --> " + gpid);
    location.href = document.location.origin + "/web/game.html?Gp=" + gpid;

  };


  //*********************************************************************************
  // USER LOGIN - save user authentication
  function saveUser(player) {

    if (player == null) {
      userInfo.setUserId(null);
      userInfo.setUserName(null);
    } else {
      userInfo.setUserId(player.id);
      userInfo.setUserName(player.userName);
    }

  }

  function showUsrLogin(user) {

    if (user == null) {
      $(DOMStrings.txtUserLogin).html("");
      $(DOMStrings.boxUserLogin).hide();

      $(DOMStrings.logoutGames).hide();
      $(DOMStrings.loginGames).show();

      $(DOMEventStrings.create_game).hide();
      $(DOMEventStrings.join_game).hide();
    } else {
      $(DOMStrings.txtUserLogin).html(user);
      $(DOMStrings.boxUserLogin).show();

      $(DOMStrings.loginGames).hide();
      $(DOMStrings.logoutGames).show();

      $(DOMEventStrings.create_game).show();
      $(DOMEventStrings.join_game).show().css("display", "inline-block");
    }
  }

  function resetFieldForm() {

    $(DOMStrings.formError).html("");
    $(DOMStrings.usr).val('').css({
      "background-color": "white"
    });
    $(DOMStrings.pwd).val('').css({
      "background-color": "white"
    });

  };

  //*********************************************************************************
  //Tratamiento JSON API -> /API/GAMES
  var loadApiGames = function () {

    console.log("loadApiGames: ");
    resetFieldForm();

    var getApiGames = utilidades.getDatos(APIurlStrings.apiGames);
    getApiGames.done(function (data) {
      console.log(data);

      saveUser(data[0].player);
      showListGames(data[0].listaGames);
      showTableScore(data[0].tableStat);
      showUsrLogin(userInfo.getUserName());

      // Evento Join Game despues de crear table
      $(DOMEventStrings.join_game).on("click", joinUsrGame);
      $(DOMEventStrings.view_game).on("click", viewUsrGame);

    }).fail(function (jqXHR, textStatus) {
      showPageError("404");
    });
  };

  //*********************************************************************************
  // Login USER PLAYER GAME
  var loginUsrPlayer = function () {

    console.log("loginUsrPlayer: ");
    //event.preventDefault();
    var usr = $(DOMStrings.usrLogin).val();
    var pwd = $(DOMStrings.pwdLogin).val();
    var error = validarDatosForm(usr, pwd);

    // 3.- Llamada API Login new Player
    if (error === '') {
      var usrLogin = {};
      usrLogin.username = usr;
      usrLogin.password = pwd;
      resetFieldForm();

      var postApiLogin = utilidades.postDatos(APIurlStrings.apiLogin, usrLogin);
      postApiLogin.done(function () {
        loadApiGames();
        $("#loginModal").modal('hide');
      }).fail(function (jqXHR, textStatus) {
        statusPost(jqXHR.status, textStatus, "formError");
      });
    }

  };

  //*********************************************************************************
  // Login USER PLAYER GAME
  var logoutUsrPlayer = function (event) {

    console.log("logoutUsrPlayer");
    event.preventDefault();
    var postApiLogout = utilidades.postDatos(APIurlStrings.apiLogout);
    postApiLogout.done(function () {
      loadApiGames();
    }).fail(function (jqXHR, textStatus) {
      statusPost(jqXHR.status, textStatus, "formError");
    });

  };


  //*********************************************************************************
  // Register USER PLAYER GAME
  var registerUsrPlayer = function () {

    console.log("registerUsrPlayer");
    //event.preventDefault();
    var name = $(DOMStrings.nameSignUp).val();
    var usr = $(DOMStrings.usrSignUp).val();
    var pwd = $(DOMStrings.pwdSignUp).val();
    var error = validarDatosForm(usr, pwd);

    if (error === '') {
      var usrRegister = {};
      usrRegister.name = name;
      usrRegister.username = usr;
      usrRegister.password = pwd;

      var postApiPlayers = utilidades.postDatos(APIurlStrings.apiPlayers, usrRegister);
      postApiPlayers.done(function () {
        $(DOMStrings.usrLogin).val(usr);
        $(DOMStrings.pwdLogin).val(pwd);
        loginUsrPlayer();
        $("#registerModal").modal('hide');
      }).fail(function (jqXHR, textStatus) {
        statusPost(jqXHR.status, textStatus, "formError");
      });
    }

  };

  //*********************************************************************************
  // Create USER PLAYER GAME
  var createUsrGame = function () {

    console.log("createUsrGame --> ");
    var postApiGames = utilidades.postDatos(APIurlStrings.apiGames);
    postApiGames.done(function (data) {
      console.log("create game: " + data.createGame.gamePlayerId);
      showPageGame(data.createGame.gamePlayerId);
    }).fail(function (jqXHR, textStatus) {
      statusPost(jqXHR.status, textStatus, "httpError");
      $(DOMStrings.modalInfo).modal();
    });

  };

  //*********************************************************************************
  // join PLAYER GAME
  var joinUsrGame = function (event) {

    console.log("joinUsrGame --> ");
    var $target = $(event.target);
    var dataIdGame = $target.data("game");

    var urlJoin = document.location.origin + APIurlStrings.apiGame + dataIdGame + "/players";
    var postApiGame = utilidades.postDatos(urlJoin);
    postApiGame.done(function (data) {

      console.log("join game: " + data.joinGame.gamePlayerId);
      showPageGame(data.joinGame.gamePlayerId);

    }).fail(function (jqXHR, textStatus) {
      statusPost(jqXHR.status, textStatus, "httpError");
      $(DOMStrings.modalInfo).modal();
    });

  };

  //*********************************************************************************
  // view GAME
  var viewUsrGame = function (event) {

    console.log("viewUsrGame --> ");
    var $target = $(event.target);
    var dataIdGameplayer = $target.data("player");

    showPageGame(dataIdGameplayer);

  };

  // Validamos el field usrName del LOGIN/REGISTER
  var validarUsrForm = function (mail) {

    var mailExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
    var error = '';

    if (mail.length === 0) {
      error = "You didn't enter a mail contact.";
    } else if (!mail.match(mailExp)) {
      error = "Formato incorrecto direccion mail, formato correcto: 'yourname@mail.com'.";
    } else {
      error = '';
    }

    console.log(" (1) error form: " + error);
    return error;
  };

  // Validamos el field Password del LOGIN/REGISTER
  var validarPwdForm = function (pwd) {

    /* Contener Mayusculas, minuscular, numeros y caracteres !? - tamaño maximo 2 a 8 */
    var pwdExp = /[A-Za-z0-9!?-]{2,8}/;
    var error = '';

    if (pwd.length === 0) {
      error = "You didn't enter a password contact.";
    } else if (!pwd.match(pwdExp)) {
      error = "Formato incorrecto password, puede contener letras, numeros y longitud de 2 a 8 caracteres.";
    } else {
      error = '';
    }

    console.log(" (2) error form: " + error);
    return error;
  };

  var validarDatosForm = function (usr, pwd) {

    // Validar form
    var errUsr = validarUsrForm(usr);
    var errPwd = validarPwdForm(pwd);

    // 1.- Validar mail form
    if (errUsr != '') {
      $(DOMStrings.usr).val('').css({
        "background-color": DOMStyle.errorForm
      });
    }

    // 2.- Validar password form
    if (errPwd != '') {
      $(DOMStrings.pwd).val('').css({
        "background-color": DOMStyle.errorForm
      });
    }

    if (errUsr !== '' || errPwd !== '') {
      $(DOMStrings.formError).html((errUsr + "<br>" + errPwd));
    }

    return errUsr + errPwd;
  };

  return {
    loadApiGames: loadApiGames,
    getDOMEventStrings: getDOMEventStrings,
    loginUsrPlayer: loginUsrPlayer,
    logoutUsrPlayer: logoutUsrPlayer,
    registerUsrPlayer: registerUsrPlayer,
    createUsrGame: createUsrGame
  }

})();

//**************************************************************
// Controler
var controller = (function (GamesInfoCtrl) {

  var setupEventListeners = function () {

    var DOMEvent = GamesInfoCtrl.getDOMEventStrings();
    $(DOMEvent.loginPlayer).on("click", GamesInfoCtrl.loginUsrPlayer);
    $(DOMEvent.logout_player).on("click", GamesInfoCtrl.logoutUsrPlayer);
    $(DOMEvent.register_player).on("click", GamesInfoCtrl.registerUsrPlayer);
    $(DOMEvent.create_game).on("click", GamesInfoCtrl.createUsrGame);

  };

  return {
    init: function () {
      console.log('Application has started');
      GamesInfoCtrl.loadApiGames();
      setupEventListeners();
    }
  };

})(GamesInfoController);

$(document).ready(function () {
  controller.init();
});