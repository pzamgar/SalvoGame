//**************************************************************
// Utilidades
var utilidades = (function () {

  // Metodo 1 - Obtener parametros url
  var getUrlParameters = function (urlHref) {

    if (urlHref.indexOf('?') > 0) {

      var getString = urlHref.split('?')[1];

      var GET = getString.split('&');
      var get = {};

      for (var i = 0, l = GET.length; i < l; i++) {
        var tmp = GET[i].split('=');
        get[tmp[0]] = decodeURI(tmp[1]);
      }
      return get;
    }
  };

  // Metodo 2 - Obtener parametros url
  var paramObj = function (search) {
    var obj = {};
    var reg = /(?:[?&]([^?&#=]+)(?:=([^&#]*))?)(?:#.*)?/g;

    search.replace(reg, function (match, param, val) {
      obj[decodeURIComponent(param)] = val === undefined ? "" : decodeURIComponent(val);
    });

    return obj;
  };

  // GET datos via URL
  var getDatos = function (url) {
    return ($.get(url));
  };

  // POST datos via URL
  var postDatos = function (url, data) {

    var urlPost = document.location.origin + url;
    return ($.post({
      url: url,
      data: data
    }));
  };

  // POST datos + contenttyp via URL
  var fetchDatos = function (url, data) {

    var urlPost = document.location.origin + url;
    return ($.post({
      url: urlPost,
      dataType: "json",
      contentType: "application/json",
      data: data
    }));
  };

  return {
    getDatos: getDatos,
    postDatos: postDatos,
    getUrlParameters: getUrlParameters,
    paramObj: paramObj,
    fetchDatos: fetchDatos
  }

})();

//**************************************************************
// Controler Drag and Drop - PAGE GAME
var controlerDnD = (function () {

  var DOMStrings = {
    tbodyDnd: 'tbodyDnd',
    formError: ".formError",
    httpError: ".httpError",
    modalInfo: "#modalInfo"
  };

  var limitGrid = {
    col: '11',
    row: 'K'
  };

  var shipDrag = {};

  //*******************************************************************************************
  //** EVENTOS DESTINO ELEMENTO ARRASTABLE
  //*******************************************************************************************
  //*******************************************************************************************
  // EVENT dragstart (SHIP)
  var dragStart = function (event) {

    console.log(" (O-1) dragStart --> ");

    // Guardamos data para arrastrar SHIP.
    event.dataTransfer.setData("text", event.target.id);
    event.dataTransfer.setDragImage(createCanvas(event.target.id, event.target.dataset.pos), 1, 1);

    // Guardamos el ship arrastrado
    shipDrag.id = event.target.id;
    shipDrag.orien = event.target.dataset.pos;

    event.target.style.opacity = '0.5';
  };

  // Creamos image Custom Drag -> CANVAS
  var createCanvas = function (id, orien) {

    var h = 0;
    var w = 0;
    var shipcolor;

    console.log(id + ":::" + orien);
    switch (id) {
      case 'drag1':
        w = 200;
        h = 40;
        shipcolor = 'pink';
        break;
      case 'drag2':
        w = 160;
        h = 40;
        shipcolor = 'brown';
        break;
      case 'drag3':
        w = 120;
        h = 40;
        shipcolor = 'greenyellow';
        break;
      case 'drag4':
        w = 120;
        h = 40;
        shipcolor = 'lightgrey';
        break;
      case 'drag5':
        w = 80;
        h = 40;
        shipcolor = 'navajowhite';
        break;
      default:
        break;
    }

    // Si orientacion vertical intercambiamos valores
    if (orien === 'ver') {
      ww = h;
      h = w;
      w = ww;
    }

    // Creamos canvas
    var canvas = document.createElement('canvas');
    if (canvas.getContext) {
      var context = canvas.getContext('2d');
      canvas.height = h + 20;
      canvas.width = w + 20;

      // Contexto canvas
      context.fillStyle = shipcolor;
      context.fillRect(5, 5, w, h);
    }

    // Creamos la Default Drag imagen
    var img = new Image();
    img.src = canvas.toDataURL("image/png");
    img.width = '80px';

    return img;
  };

  //*******************************************************************************************
  // EVENT dragEnd
  var dragEnd = function (event) {

    console.log("**********************************************************");
    console.log("[(O-2) dragEnd ] ---> tdcl: " + event.target.getAttribute("data-tdcl"));
    event.preventDefault();

    event.target.style.opacity = '1';
    var dataTdcl = event.target.getAttribute("data-tdcl");

    // Nos guardamos la lista localizaciones del SHIP en el GRID
    // si tenemos celda asignada.
    if (dataTdcl != undefined && dataTdcl != null) {
      eliminarClassRelative(event.target.getAttribute("data-tdclant"));
      var location = getCeldasShipGrid(event.target.getAttribute("data-tdcl"), event.target.id, event.target.getAttribute("data-pos"));
      event.target.setAttribute("data-locat", location);
      event.target.setAttribute("data-grid", "s");
    }

    // Comprobamos si el SHIP lo hemos insertado en HOME
    // reseteamos atributos y estilos incorporados
    validarResetShipHome(event.target.id);

    //reset blackground color celdas td
    document.getElementById('table-rows-l').style.background = 'white';

    // Validar si tenemos los SHIP's en el GRID
    if (shipListIsEmpty() == 0) {
      document.getElementById('save_Ships').style.display = 'block';
    } else {
      document.getElementById('save_Ships').style.display = 'none';
    }

    console.log("**********************************************************");
  };

  var validarResetShipHome = function (idDrag) {

    console.log("RESET!!!!!!!!!!!!!!!!!!");
    var shipHome = false;
    var lisShipHome = Array.prototype.slice.call(document.querySelectorAll('#listShips'), 0);

    console.log(lisShipHome);
    var k;
    for (k = 0; k < lisShipHome[0].children.length; k++) {
      if (lisShipHome[0].children[k].id === idDrag) {
        shipHome = true;
      }
    }

    // El SHIP a vuelto a CASA
    if (shipHome) {

      var ship = document.getElementById(idDrag);

      // Reset todos los attributos del ship
      console.log(ship.getAttribute("data-tdcl"));
      ship.removeAttribute("data-tdclant");
      ship.removeAttribute("data-tdcl");
      ship.removeAttribute("data-locat");
      ship.removeAttribute("data-grid");

      // Si tenemos posicion vertical -> volver a horizontal
      console.log(ship.dataset.pos);
      if (ship.dataset.pos === 'ver') {
        ship.dataset.pos = 'hor';
        ship.classList.remove("rotVer");
        ship.classList.add("rotHor");
      }
    }
  };

  //*******************************************************************************************
  //** EVENTOS DESTINO CAIDA ELEMENTO DRAG
  //*******************************************************************************************
  //*******************************************************************************************
  // EVENT dragenter
  var dragEnter = function (event) {

    console.log(" (2) dragenter", event.target);

    // 1.- Celda con atributo ship (celda vacia)
    if (event.target.getAttribute("data-ship") === "ship") {

      console.log("celda vacia!!!!!!!!!!!!!!!!!!");
      if (colisionCeldasLimiteGrid(event.target.dataset.celda, shipDrag.id, shipDrag.orien) !== 'ok') {
        event.target.style.background = "red";
      } else {
        event.target.style.background = "green";
      }
    }
    console.log("**********************************************************");

  };

  //*******************************************************************************************
  // EVENT dragleave
  var dragLeave = function (event) {

    // Reset background-color celda vacia
    if (event.target.getAttribute("data-ship") === "ship") {
      event.target.style.background = "";
    }
  };

  //*******************************************************************************************
  // EVENT dragover
  var dragOver = function (event) {

    event.preventDefault();
  };

  //*******************************************************************************************
  // EVENT drop
  var drop = function (event) {

    console.log("*****************************************************");
    console.log("(4) drop ");
    event.preventDefault();

    var data = event.dataTransfer.getData("text");

    if (event.target.getAttribute("data-ship") &&
        colisionCeldasLimiteGrid(event.target.dataset.celda,
            document.getElementById(data).getAttribute("id"),
            document.getElementById(data).getAttribute("data-pos")) !== 'ok') {
      event.target.style.background = "";
      return false;
    }

    // Comprobamos si la celda TD tiene el atributo "ship" -> celda libre
    if (event.target.getAttribute("data-ship") ||
        event.target.getAttribute("data-box")) {
      //var data = event.dataTransfer.getData("text");
      event.target.appendChild(document.getElementById(data));

      // Comprobamos si estamos en el box origen o en el grid
      if (event.target.getAttribute("data-box")) {
        console.log(" box origen ---> ");

        // -- Eliminamos classe posicion absoluta y atributo posicion Celda Grid
        eliminarClassRelative(document.getElementById(data).getAttribute("data-tdcl"));
        document.getElementById(data).classList.remove("shipAbs");
        document.getElementById(data).removeAttribute("data-tdcl");
      } else {

        console.log(" box Grid ---> ");
        var posCl = event.target.dataset.celda;

        //Añadimos posicion absoluta para el ship seleccionado para Drag (elemento Origen)
        // 1.- Elemento SHIP ->
        //   - Add class posicion absolut.
        //   - Añadir data-attributo -> posicion.
        document.getElementById(data).classList.add("shipAbs");
        var posAnt = document.getElementById(data).getAttribute('data-tdcl');
        document.getElementById(data).setAttribute('data-tdclant', posAnt);
        document.getElementById(data).setAttribute('data-tdcl', posCl);

        //Añadimos posicion relativo en la celda donde ubicamos el ship (elemento destino)
        // 2.- Elemnto GRID ->
        //   - Add class posicion relativo.
        //   - Reset estilos TD grid.
        event.target.classList.add("shipRel");
        event.target.style.background = "";
      }
    } else {
      //Celda ocupada por SHIP
      console.log("false!!!!!!!!!!!!!!");
      return false;
    }

    console.log("*****************************************************");

  };

  //*******************************************************************************************
  //
  var moveShipSketch = function (event) {

    console.log("moveShipSketch ---> ");

    // Obtenemos location list SHIP -> futuras
    var posShip = event.target.getAttribute("data-pos");
    var tdcl = event.target.getAttribute("data-tdcl");
    var location = getCeldasShipGrid(tdcl, event.target.id, (posShip === 'hor' ? 'ver' : 'hor'));
    var locationArr = location.split('-');
    var moverShip = true;

    if (calcularLimiteGrid(locationArr[locationArr.length - 1]) === 'ok') {
      if (colisionCeldasShip(event.target.id, locationArr) > 0)
        moverShip = false;
    } else {
      moverShip = false;
    }

    console.log(" MoverShip ------>" + moverShip);
    if (moverShip) {
      // Control Orientacion de SHIP
      if (posShip === "hor") {
        event.target.classList.remove("rotHor");
        event.target.classList.add("rotVer");
        event.target.setAttribute("data-pos", "ver");
      } else {
        event.target.classList.remove("rotVer");
        event.target.classList.add("rotHor");
        event.target.setAttribute("data-pos", "hor");
      }

      event.target.setAttribute("data-locat", location);
    } else {
      event.target.classList.add("shipCollision");
      setTimeout(function () {
        event.target.classList.remove("shipCollision");
      }, 1000);
    }


  };

  // Obtenemos la longitud del SHIP via su id
  var getLongShip = function (idShip) {

    switch (idShip) {
      case 'drag1':
        return 5;
        break;
      case 'drag2':
        return 4;
        break;
      case 'drag3':
        return 3;
        break;
      case 'drag4':
        return 3;
        break;
      case 'drag5':
        return 2;
        break;
      default:
        return 0;
        break;
    }
  };

  // Obtenemos nombre tipo SHIP via su id
  var getNameShip = function (shipId) {

    var color = '';
    switch (shipId) {
      case 'drag1':
        return 'Carrier';
        break;
      case 'drag2':
        return 'Battleship';
        break;
      case 'drag3':
        return 'Submarine';
        break;
      case 'drag4':
        return 'Destroyer';
        break;
      case 'drag5':
        return 'Patrol Boat';
        break;
      default:
        return '';
        break;
    }
  };

  //*******************************************************
  // Obtenemos las casillas que ocupan el SHIP en el GRID
  // celda  -> celda inicial que ocupa el ship
  // idDrag -> id del SHIP
  // orien  -> orientacion del barco
  //*******************************************************
  var getCeldasShipGrid = function (celda, idDrag, orien) {

    console.log("getCeldasShipGrid ->>>>>>> ");
    var letPos = celda.substring(0, 1);
    var letPosN = celda.charCodeAt(0);
    var numPos = parseInt(celda.substr(1));
    var numPosC = celda.substr(1);

    //lista de celdas que ocupara el barco (segun orientacion (horizontal/vertical))
    var location = celda + '-';

    var i;
    for (i = 1; i < getLongShip(idDrag); i++) {
      // Orientacion horizontal -> incremento columnas (numeros)
      // Orientacion vertical   -> incremento filas (letras)
      if (orien === 'hor') {
        location += (letPos + (numPos + i).toString()) + '-';
      } else {
        location += (String.fromCharCode(letPosN + i) + numPosC) + '-';
      }
    }

    return location.substring(0, location.length - 1);

  };

  // Validamos los limites del GRID con el SHIP que vamos a posicionar
  var colisionCeldasLimiteGrid = function (posCl, idDrag, orien) {

    console.log("colisionCeldasLimiteGrid ------> " + posCl + "::" + idDrag + "::" + orien);
    var valid = '';

    var location = getCeldasShipGrid(posCl, idDrag, orien).split('-');
    var lastLocat = location[location.length - 1];

    if (colisionCeldasShip(idDrag, location) > 0) {
      return 'nok';
    } else {
      return calcularLimiteGrid(lastLocat);
    }

  };

  var calcularLimiteGrid = function (lastLocat) {

    console.log("***** calcularLimiteGrid [START] ******************* : " + lastLocat);
    lcol = lastLocat.substring(1);
    lrow = lastLocat.substring(0, 1);

    // Comprobamos la posicion final con los limites.
    if (parseInt(lcol) < parseInt(limitGrid.col) && lrow.localeCompare(limitGrid.row) < 0) {
      return 'ok';
    } else {
      return 'nok';
    }
    console.log("***** calcularLimiteGrid [END] *******************" + lastLocat);
  };

  // Comprobar colision celdas entre SHIPS que hay en el GRID
  var colisionCeldasShip = function (id, locatDrag) {

    console.log("***** colisionCeldasShip [START] ******************* id: " + id);
    var listShips = [];

    // Lista posiciones ships que tenemos en la GRID
    var i;
    for (i = 1; i <= 5; i++) {
      if (id !== ('drag' + i) && document.getElementById('drag' + i).getAttribute('data-grid') != null) {
        listShips = listShips.concat(document.getElementById('drag' + i).getAttribute('data-locat').split('-'));
      }
    }

    // validar si colisionan las celdas
    //var newArr = locatDrag.filter(item => listShips.indexOf(item) !== -1);
    var newArr = locatDrag.filter(function (item) {
      return listShips.indexOf(item) !== -1
    });
    console.log("1: " + locatDrag);
    console.log("2: " + listShips);
    console.log("3: " + newArr);
    console.log("4: " + newArr.length);
    console.log("***** colisionCeldasShip [END] *******************");
    return newArr.length;
  }

  // Validamos si tenemos todos los SHIPS colocados en el GRID
  var shipListIsEmpty = function () {

    var listShips = document.getElementById('listShips');
    return listShips.children.length;
  };

  // Funcion para salvar SHIPS en el repositorio Backend.
  var saveShipsUser = function () {
    console.log("saveShipsUser: ");

    var ApiUrl = GameInfoController.getApiurlStrings();

    // 1.- Obtener id gameplayer por parametros url
    var param = utilidades.getUrlParameters(document.location.href);
    var url;
    if (param != undefined) {
      url = ApiUrl.appiAddShips + param.Gp + "/ships";
    } else {
      url = ApiUrl.appiAddShips + 0 + "/ships";
    }

    // 2.- Datos de los SHIPS + location
    var listShip = [];

    var listNode = document.querySelectorAll('.itemShip');
    var i;
    for (i = 0; i < listNode.length; i++) {
      var obj = {};
      console.log(listNode[i].dataset.locat.split());
      console.log(getNameShip(listNode[i].id));
      obj.shipType = getNameShip(listNode[i].id);
      obj.locations = listNode[i].dataset.locat.split('-');
      listShip.push(obj);
    }

    listShip = [];
    obj.shipType = "Carrier";
    obj.locations = ["A6", "A7", "A8", "A9", "A10"];
    listShip.push(obj);
    console.log(listShip);
    console.log(JSON.stringify(listShip));
    var dataShips = JSON.stringify(listShip);

    // 3.- LLamada API add ships -> metodo POST (lista ships + locations)
    var postApiAddShips = utilidades.fetchDatos(url, dataShips);
    postApiAddShips.done(function (response, status, jqXHR) {
      console.log(response);
      //GameInfoController.showPageGameView(param.Gp);
    }).fail(function (jqXHR, textStatus) {
      console.log(jqXHR);
      GameInfoController.statusPost(jqXHR.status, jqXHR.responseJSON.error, "httpError");
      $(DOMStrings.modalInfo).modal();
    });
  };

  // Funcion eliminar clase relative
  var eliminarClassRelative = function (celda) {

    console.log("Celda ship", celda);

    // Recorremos lista de todos los TD que tenemos class shipRel
    list = document.querySelectorAll('.shipRel');
    list.forEach(function (item) {
      if (item.dataset.celda === celda) {
        console.log("borrado!!!!!");
        item.classList.remove("shipRel");
      }
    });

  };

  var setupEventsDnD = function () {

    console.log("setupEventsDnD --> ");

    var carrie = document.getElementById("drag1");
    var battle = document.getElementById("drag2");
    var submar = document.getElementById("drag3");
    var destro = document.getElementById("drag4");
    var patrol = document.getElementById("drag5");
    var listShips = document.getElementById("listShips");
    var tbodyDnd = document.getElementById("table-rows-l");
    var save_Ships = document.getElementById("save_Ships");
    var save_Salvos = document.getElementById("save_Salvos");

    // Eventos Drag and Drop
    carrie.addEventListener("dragstart", dragStart, false);
    battle.addEventListener("dragstart", dragStart, false);
    submar.addEventListener("dragstart", dragStart, false);
    destro.addEventListener("dragstart", dragStart, false);
    patrol.addEventListener("dragstart", dragStart, false);

    carrie.addEventListener("dragend", dragEnd, false);
    battle.addEventListener("dragend", dragEnd, false);
    submar.addEventListener("dragend", dragEnd, false);
    destro.addEventListener("dragend", dragEnd, false);
    patrol.addEventListener("dragend", dragEnd, false);

    tbodyDnd.addEventListener("dragenter", dragEnter, false);
    tbodyDnd.addEventListener("dragleave", dragLeave, false);

    tbodyDnd.addEventListener("dragover", dragOver, false);
    listShips.addEventListener("dragover", dragOver, false);

    tbodyDnd.addEventListener("drop", drop, false);
    listShips.addEventListener("drop", drop, false);

    // Eventos doble click SHIPS -> movimiento vertical
    carrie.addEventListener("dblclick", moveShipSketch);
    battle.addEventListener("dblclick", moveShipSketch);
    submar.addEventListener("dblclick", moveShipSketch);
    destro.addEventListener("dblclick", moveShipSketch);
    patrol.addEventListener("dblclick", moveShipSketch);

    // Evento button SAVE SHIPS
    save_Ships.addEventListener("click", saveShipsUser);
  };

  return {
    init: function () {
      console.log('Init Controller Drag and Drop.');
      setupEventsDnD();
    }
  };

})();

//**************************************************************
// Controler Page GAME
var GameInfoController = (function () {

  var DOMStrings = {
    formError: ".formError",
    httpError: ".httpError",
    modalInfo: "#modalInfo"
  };


  var DOMEventStrings = {
    logout_player: '#logout_player',
    save_Salvos: '#save_Salvos',
    cellSalvo: '.cellSalvo'
  };

  var APIurlStrings = {
    apiLogout: '/api/logout',
    apiGameView: '/api/game_view/',
    appiAddShips: '/api/games/players/',
    appiAddSalvos: '/api/games/players/'
  };

  var dataMatriz = {};
  var inicial = '';

  // Tratamiento Salvo del Game
  var salvoHits = {
    turnSalvo: 0,
    numSalvos: 0,
    listSalvos: [],

    setTurnSalvo: function (turn) {
      this.turnSalvo = turn;
    },
    getTurnSalvo: function () {
      return this.turnSalvo;
    },
    getNumSalvos: function () {
      return this.numSalvos;
    },
    addSalvoList: function (celda) {
      this.listSalvos.push(celda);
      this.numSalvos++;
    },
    removeSalvoList: function (celda) {

      var posCelda = this.listSalvos.indexOf(celda);
      this.listSalvos.splice(posCelda);
      this.numSalvos--;
    },
    getSalvoObject: function () {
      var obj = {
        "turn": this.turnSalvo.toString(),
        "locations": this.listSalvos
      }
      return obj;
    },
    showSalvoList: function () {
      console.log(this.listSalvos + " : " + this.numSalvos + " ::: " + this.turnSalvo);
    }
  };

  // Tratamiento Hits table history
  var histHits = {
    local: {
      "Carrier": 0,
      "Battleship": 0,
      "Submarine": 0,
      "Destroyer": 0,
      "Patrol Boat": 0
    },
    opponent: {
      "Carrier": 0,
      "Battleship": 0,
      "Submarine": 0,
      "Destroyer": 0,
      "Patrol Boat": 0
    },
    getSunkShip: function (typeShip, hits) {

      var res = false;
      switch (typeShip.toString()) {
        case 'Carrier':
          if (hits == 5) res = true;
          break;
        case 'Battleship':
          if (hits == 4) res = true;
          break;
        case 'Submarine':
          if (hits == 3) res = true;
          break;
        case 'Destroyer':
          if (hits == 3) res = true;
          break;
        case 'Patrol Boat':
          console.log(typeShip + " ok ");
          if (hits == 2) res = true;
          break;
        default:
          res = false;
          break;
      }
      return res;
    }
  };


  //*************************************************************************
  //*** METODOS
  //*************************************************************************
  // Return Strings DOM
  var getDOMEventStrings = function () {
    return DOMEventStrings;
  };

  // Return Strings API backend
  var getAPIurlStrings = function () {
    return APIurlStrings;
  };

  //De la matriz de la cabecera de la tabla para indicar los numeros
  var getHeadersHtml = function (data) {
    return "<tr><th></th>" + data.fila_numbers.map(function (num) {
      return "<th>" + num + "</th>";
    }).join("") + "</tr>";
  };

  //De la matriz de la cabecera de la tabla para indicar las letaras.
  var getRowsHtml = function (data) {
    return data.fila_numbers.map(function (row, i) {
      var letter = data.columna_letters[i];
      return "<tr><th>" + data.columna_letters[i] + "</th>" + rowTableHome(letter, data.fila_numbers) + "</tr>";
    }).join("");
  };

  var rowTableHome = function (letter, numbers) {

    var data = '';
    numbers.forEach(function (value) {

      // Classe para identificar salvos
      var cellSalvo = inicial === 'V' ? 'cellSalvo' : '';
      data += "<td class='" + inicial + (letter + value) + " " + cellSalvo + "' data-celda='" + (letter + value) + "' data-ship='ship'></td>";
    });
    return data;
  };

  //Render la cabecera de la tabla
  var renderHeaders = function (data, table) {
    var html = getHeadersHtml(data);
    document.getElementById(table).innerHTML = html;
  };

  //Render la cabecera de la fila con las letras
  var renderRows = function (data, table) {
    var html = getRowsHtml(data);
    document.getElementById(table).innerHTML = html;
  };

  var renderTable = function (data) {

    // 1.- Creamos la tabla jugador local (barcos + disparos oponente
    inicial = 'L';
    renderHeaders(data, "table-headers-l");
    renderRows(data, "table-rows-l");
  };

  var renderTableEnemy = function (data) {

    // 2.- Creamos la tabla jugador oponente (disparos jugador local)
    inicial = 'V';
    renderHeaders(data, "table-headers-v");
    renderRows(data, "table-rows-v");
  };

  //*******************************************************
  // Table History Hits/Sinks
  var renderTableHistory = function (data, gameId) {

    $("#gamePlay").html("Game " + gameId);
    renderHeadersHits("theadHits");
    renderRowsHits(data, "tbodyHits");
    console.log(histHits);
  };

  var renderHeadersHits = function (table) {
    //var html = "<tr><th rowspan=2>Turn</th><th colspan=2>Opponent</th></tr>";
    var html = "<tr class='headHistory'><th>Turn</th><th>hits</th><th>Left</th></tr>";
    document.getElementById(table).innerHTML = html;
  };

  var renderRowsHits = function (data, table) {
    var html = getRowsHitsHtml(data);
    document.getElementById(table).innerHTML = html;
  };

  var getRowsHitsHtml = function (data) {
    return data.history.map(function (row) {
      console.log(row);
      var wave = "<span class='salvoFail'><svg class='explosion__icon'><use href='img/waves.svg#Layer_1'></use></svg></span>";
      var shipCellHis = getHitHistory(row.opponent, "opponent") !== '' ? getHitHistory(row.opponent, "opponent") : wave;
      var html = "<tr><td>" + row.turn + "</td><td>" + shipCellHis + "</td><td>" + row.leftO + "</td></tr>";
      return html;

    }).join("");
  };

  var getHitHistory = function (row, side) {
    console.log("getHitHistory: " + side);
    console.log(row);
    console.log("********************");
    return row.map(function (value) {
      // Contador de hits para cada SHIP
      var key = Object.keys(value);
      histHits[side][key] += value[key];
      var res = histHits.getSunkShip(key, histHits[side][key]);
      //var sunk = res == true ? "sunk!!!!" : "";

      //return "<p>" + key + " (" + value[key] + ") " + sunk + "</p>"
      return "<p class='" + getClassShip(key[0]) + "'>" + getTouchShip(value[key], res) + "</p>";
    }).join("");
  };

  /***********************************************************
   var getLeftHistory = function (row) {
    console.log("getLeftHistory");
    return row.reduce(function (total, value) {
      var key = Object.keys(value);
      return total + parseInt(value[key]);
    }, 0);
  };
   ************************************************************/

  var getClassShip = function (keyShip) {

    console.log("---->>>" + keyShip);
    console.log(typeof keyShip);
    var html = '';
    switch (keyShip) {
      case 'Carrier':
        html = 'carrier';
        break;
      case 'Battleship':
        html = 'battleship';
        break;
      case 'Submarine':
        html = 'submarine';
        break;
      case 'Destroyer':
        html = 'destroyer';
        break;
      case 'Patrol Boat':
        html = 'patrolBoat';
        break;
      default:
        break;
    }

    console.log("hmtl -->" + html);
    return html;

  };

  var getTouchShip = function (numTouch, sunk) {

    var html = '';
    switch (numTouch) {
      case 0:
        html = "<span class='salvoFail'><svg class='explosion__icon'><use href='img/waves.svg#Layer_1'></use></svg></span>";
        break;
      case 1:
        html = "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        break;
      case 2:
        html = "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        html += "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        break;
      case 3:
        html = "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        html += "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        html += "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        break;
      case 4:
        html = "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        html += "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        html += "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        html += "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        break;
      case 5:
        html = "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        html += "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        html += "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        html += "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        html += "<span class='salvoFire'><svg class='explosion__icon'><use href='img/flame.svg#Layer_1'></use></svg></span>";
        break;
      default:
        html = "<span class='salvoFail'><svg class='explosion__icon'><use href='img/waves.svg#Layer_1'></use></svg></span>";
        break;
    }

    if (sunk) {
      html = "<span class='salvoFail'><svg class='explosion__icon'><use href='img/explosion1.svg#Layer_1'></use></svg></span>";
    }

    return html;
  };

  var colorShip = function (shipName) {

    var color = '';
    switch (shipName) {
      case 'Carrier':
        color = 'spCarrier';
        break;
      case 'Battleship':
        color = 'spBattleship';
        break;
      case 'Submarine':
        color = 'spSubmarine';
        break;
      case 'Destroyer':
        color = 'spDestroyer';
        break;
      case 'Patrol Boat':
        color = 'spPatrolBoat';
        break;
      default:
        break;
    }

    return color;
  };

  var isrtShipTable = function (data) {

    data.ships.forEach(function (value) {
      value.locations.forEach(function (value2) {
        $(".L" + value2).addClass(colorShip(value.type)).attr("data-salvo", "touch");
      })
    });
  };

  var isrtSalvoTable = function (data) {

    console.log("isrtSalvoTable ----->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(data);

    var turn = 0;
    data.salvoes.forEach(function (value) {
      value.locations.forEach(function (value2) {
        if (value.player === data.idPlayer) {
          //$(".V" + value2).html("<span class='salvoLocal'value.turn >" + + "</span>");
          $(".V" + value2).html("<span class='salvoLocal'><svg class='explosion__icon'><use href='img/shooting-star.svg#Layer_1'></use></svg>" +
              "<span class='turn_salvo'>" + value.turn + "</span></span>");
          $(".V" + value2).removeClass("cellSalvo");
          $(".V" + value2).addClass("cellRelative");

          // Nos quedamos con el turn mas grande
          if (turn < value.turn) {
            turn = value.turn;
          }
        } else {
          if ($(".L" + value2).data("salvo")) {
            // $(".L" + value2).html("<span class='salvoVisit'>" + value.turn + "</span>");
            $(".L" + value2).html("<span class='salvoVisit'><svg class='explosion__icon'><use href='img/explosion.svg#Capa_1'></use></svg></span>");
          }
        }
      });
    });
    salvoHits.setTurnSalvo(turn + 1);
  };

  var renderGamePlayers = function (gamePlayerId, dataPlayers) {

    var playerLocal, playerVisit, htmlLocal, htmlOponent, viewplayer;

    viewplayer = 0;
    playerLocal = '';
    playerVisit = '';

    //Recorrer la lista de Pla  yers
    dataPlayers.forEach(function (value) {

      if (value.Player.gpid === parseInt(gamePlayerId)) {
        playerLocal = value.Player.name;
        viewplayer = value.Player.id;
        $(".txtUserLogin").html(playerLocal);
      } else {
        playerVisit = value.Player.name;
      }
    });

    htmlLocal = playerLocal == '' ? "N/A" : playerLocal;
    htmlOponent = playerVisit == '' ? "New Oponent" : playerVisit;
    $(".local").html(htmlLocal);
    $(".oponent").html(htmlOponent);

    return viewplayer;
  };

  var showPage404 = function () {
    location.href = "../public/error/404.html";
  }

  var showPage401 = function () {
    location.href = "../public/error/401.html";
  }

  var getFilasTable = function (numFilas) {

    var list = [], i;
    for (i = 0; i < numFilas; i++) {
      list.push(i + 1);
    }
    return list;
  }

  var getColumnasTable = function (numColumns) {

    var list = [], i;

    for (i = 65; i < (65 + numColumns); i++) {
      list.push(String.fromCharCode(i));
    }

    return list;
  }

  //Tratamiento LOGOUT
  var logoutUsrPlayer = function (event) {

    console.log("logoutUsrPlayer ----> ");
    event.preventDefault();
    var postApiLogout = utilidades.postDatos(APIurlStrings.apiLogout);
    postApiLogout.done(function () {
      redirectPageGames();
    }).fail(function (jqXHR, textStatus) {
      console.log(jqXHR);
      statusPost(jqXHR.status, jqXHR.responseJSON.error, "formError");
      $(DOMStrings.modalInfo).modal();
    });
  };

  function statusPost(status, txterror, keyerr) {

    console.log("statusPost: " + status + ":: " + txterror + "::: " + keyerr);
    switch (status) {
      case 200:
        break;
      case 201:
        break;
      case 401:
        $(DOMStrings[keyerr]).html(txterror);
        break;
      case 403:
        $(DOMStrings[keyerr]).html(txterror);
        break;
      case 404:
        break
      default:
        $(DOMStrings[keyerr]).html(txterror);
        break;
    }

  }

  var redirectPageGames = function () {

    // var urlGet = document.location.origin + "";
    location.href = "/web/index.html";
  }

  var showPageGameView = function (gamePlayerId) {
    location.href = "/web/game.html?Gp=" + gamePlayerId;
  }

  var loadGamePlayer = function (param) {

    console.log("loadGamePlayer -----> ");
    var url;

    if (param != undefined) {
      url = APIurlStrings.apiGameView + param.Gp;
    } else {
      url = APIurlStrings.apiGameView + 0;
    }

    var getApiGameView = utilidades.getDatos(url);
    getApiGameView.done(function (data) {
      console.log(data);

      dataMatriz.gameId = data.gameView.id;
      dataMatriz.fila_numbers = getFilasTable(10);
      dataMatriz.columna_letters = getColumnasTable(10);

      dataMatriz.ships = data.gameView.ships;
      dataMatriz.salvoes = data.gameView.salvoes;
      dataMatriz.idPlayer = renderGamePlayers(param.Gp, data.gameView.gamePlayer);
      dataMatriz.historyHits = data.gameView.historyHits;
      dataMatriz.stateGame = data.gameView.stateGame;

      controlFlowGame(dataMatriz);

    }).fail(function (jqXHR, textStatus) {
      //showFailPageAjax();
      console.log(jqXHR.status);
      console.log(textStatus)
      switch (jqXHR.status) {
        case 401:
          showPage401();
          break;
        default:
          showPage404();
          break;
      }
    });
  };

  var selectSalvoGrid = function (event) {

    console.log("selectSalvoGrid : ");
    console.log(this);

    salvoHits.showSalvoList();

    if (salvoHits.getNumSalvos() === 5) {

      // Solo podemos deselecionar salvos
      console.log("salvos maximo  -> 5 " + this.dataset.salvo);
      if (this.dataset.salvo) {
        salvoHits.removeSalvoList(this.dataset.celda);
        this.removeAttribute("data-salvo");
        this.removeChild(this.firstChild);
      }

    } else {

      // Deseleccionamos salvos o añadimos salvos
      console.log(this.dataset.salvo);

      if (this.dataset.salvo) {
        salvoHits.removeSalvoList(this.dataset.celda);
        this.removeAttribute("data-salvo");
        this.removeChild(this.firstChild);
      } else {
        salvoHits.addSalvoList(this.dataset.celda);
        this.setAttribute("data-salvo", "hit");
        var span = document.createElement('span');
        //span.innerHTML = salvoHits.getTurnSalvo();
        span.innerHTML = "<svg class='explosion__icon'><use href='img/shooting-star.svg#Layer_1'></use></svg>";
        span.classList.add("salvoLocal");
        this.appendChild(span);
      }
    }

    salvoHits.showSalvoList();

    // Mostramos btn add SALVO
    if (salvoHits.getNumSalvos() === 5) {
      $("#save_Salvos").show();
    } else {
      $("#save_Salvos").hide();
    }

  };

  // Funcion para salvar SALVOS en el repositorio Backend.
  var saveSalvosUser = function () {

    console.log("saveSalvosUser: ");

    var ApiUrl = GameInfoController.getApiurlStrings();

    // 1.- Obtener id gameplayer por parametros url
    var param = utilidades.getUrlParameters(document.location.href);
    var url;
    if (param != undefined) {
      url = ApiUrl.appiAddSalvos + param.Gp + "/salvos";
    } else {
      url = ApiUrl.appiAddSalvos + 0 + "/salvos";
    }

    // 2.- Datos de los SALVOS + location
    //var salvo = {"turn": "1", "locations": ["A1", "B1", "C1", "D1", "E1", "F1"]};
    var salvo = salvoHits.getSalvoObject();
    console.log(salvo);

    // 3.- LLamada API add ships -> metodo POST (lista ships + locations)
    var postApiAddSalvos = utilidades.fetchDatos(url, JSON.stringify(salvo));
    postApiAddSalvos.done(function (response, status, jqXHR) {
      console.log(response);
      GameInfoController.showPageGameView(param.Gp);
    }).fail(function (jqXHR, textStatus) {
      console.log(jqXHR);
      GameInfoController.statusPost(jqXHR.status, jqXHR.responseJSON.error, "httpError");
      $(DOMStrings.modalInfo).modal();
    });

  };

  //**************************************************************************
  // Control Flow GAME segun el estado en que se encuentra el GAME
  var controlFlowGame = function (objState) {

    console.log(objState);

    if (objState.stateGame != undefined) {
      //Mostrar estado por pantalla
      $(".boxStateGame").html(objState.stateGame.msg);
      $(".logoutGames").show();

      // Lista estados del GAME
      // 0: Inicio game
      // 1: Juego sin oponente despues de Colocar los SHIPS.
      // 2: Colocar SHIPS en GRID
      // 3: Oponente sin SHIP
      // 4: Enter Salvo
      // 5: Wait
      // 6: Game Over
      //***********************************
      if (objState.stateGame.state === 1) {
        renderTable(dataMatriz);
        isrtShipTable(dataMatriz);

        $('.boxLista').hide();
        $('.boxEnemy').hide();

        startAnnoying();
      }

      if (objState.stateGame.state === 2) {
        renderTable(dataMatriz);
        isrtShipTable(dataMatriz);

        if (dataMatriz.ships.length == 0) {
          $('.boxLista').show();
        }
        $('.boxEnemy').hide();
      }

      if (objState.stateGame.state === 3) {
        renderTable(dataMatriz);
        isrtShipTable(dataMatriz);
        renderTableEnemy(dataMatriz);
        isrtSalvoTable(dataMatriz);
        $('.listaShips').hide();
        $('.boxEnemy').show();

        startAnnoying();
      }

      if (objState.stateGame.state === 4 ||
          objState.stateGame.state === 5 ||
          objState.stateGame.state === 6) {
        renderTable(dataMatriz);
        isrtShipTable(dataMatriz);
        renderTableEnemy(dataMatriz);
        isrtSalvoTable(dataMatriz);
        $('.listaShips').hide();
        $('.boxEnemy').show();

        if (objState.stateGame.state === 4) {
          $(DOMEventStrings.cellSalvo).on("click", selectSalvoGrid);
        }

        if (objState.stateGame.state === 5) {
          startAnnoying();
        }

        if (dataMatriz.historyHits.history.length > 0) {
          $('.boxHistory').show();
          renderTableHistory(dataMatriz.historyHits, dataMatriz.gameId);
        }
      }
    }

  };

  var startAnnoying = function () {
    timerId = setTimeout(function () {
      //console.log("hi");
      //startAnnoying();
      loadGamePlayer(utilidades.getUrlParameters(document.location.href));
    }, 5000); // 5 segundos
  }


  //*************************************************************************
  //*** RETURN FUNCIONES PUBLICAS
  //*************************************************************************
  return {
    getDOMEventStrings: getDOMEventStrings,
    getApiurlStrings: getAPIurlStrings,
    logoutUsrPlayer: logoutUsrPlayer,
    loadGamePlayer: loadGamePlayer,
    showPageGameView: showPageGameView,
    statusPost: statusPost,
    saveSalvosUser: saveSalvosUser
  };

})();

//**************************************************************
// Controler
var controller = (function (GameInfoCtrl) {

  var setupEventListeners = function () {

    var DOMEvent = GameInfoCtrl.getDOMEventStrings();
    $(DOMEvent.logout_player).on("click", GameInfoCtrl.logoutUsrPlayer);
    $(DOMEvent.save_Salvos).on("click", GameInfoCtrl.saveSalvosUser);
  };

  return {
    init: function () {
      console.log('Application has started');
      GameInfoCtrl.loadGamePlayer(utilidades.getUrlParameters(document.location.href));
      setupEventListeners();
      controlerDnD.init();
    }
  };


})(GameInfoController);

$(function () {
  controller.init();
});

