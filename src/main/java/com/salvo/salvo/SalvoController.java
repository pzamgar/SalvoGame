package com.salvo.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

@RestController
@RequestMapping("/api")
public class SalvoController {

  @Autowired
  private GameRepository repoGame;

  @Autowired
  private PlayerRepository repoPlayer;

  @Autowired
  private GamePlayerRepository repoGamePlayer;

  @Autowired
  private ShipRepository repoShip;

  @Autowired
  private SalvoRepository repoSalvo;

  @Autowired
  private ScoreRepository repoScore;

  /**
   * API objecto JSON con datos de los GAMES
   *
   * @param authentication
   * @return List Objects (DTO)
   */
  @RequestMapping("/games")
  public List<Object> getGames(Authentication authentication) {

    System.out.println(" (1) getGames -----> ");

    List<Object> lg = new ArrayList<>();
    Map<String, Object> dto = new LinkedHashMap<>();

    if (getPlayerLogin(authentication) == null) {
      dto.put("player", null);
    } else {
      Map<String, Object> dtoPlayer = new LinkedHashMap<>();
      Player player = new Player();
      player = getPlayerLogin(authentication);
      dtoPlayer.put("id", player.getId());
      dtoPlayer.put("userName", player.getUserName());
      dto.put("player", dtoPlayer);
    }

    dto.put("listaGames", repoGame.findAll().stream().
            map(game -> GameDTO(game)).
            collect(Collectors.toList()));
    dto.put("tableStat", repoGame.findAll().stream().
            map(game -> game.getPlayers()).
            flatMap(players -> players.stream()).
            map(player -> calcularStaticsGames(player)).
            distinct().
            collect(toList()));
    lg.add(dto);

    return lg;
  }

  /**
   * Estadisticas puntuacion Games
   *
   * @param player
   * @return Map: String, Object
   */
  private Map<String, Object> calcularStaticsGames(Player player) {

    Map<String, Object> dto = new LinkedHashMap<>();

    // Estadisticas Jugador/Games
    dto.put("mail", player.getUserName());
    dto.put("total", totalScoreGamesPlayer(player));
    dto.put("win", winGamesPlayer(player));
    dto.put("lose", loseGamesPlayer(player));
    dto.put("tie", tieGamesPlayer(player));
    return dto;
  }

  /**
   * Obtiene la suma puntuacion de los Juegos que tiene un player
   *
   * @param player
   * @return Double, total la suma de las puntuaciones
   */
  private Double totalScoreGamesPlayer(Player player) {
    return repoGame.findAll().stream().map(game -> {

      if (player.getScore(game) != null) {
        return player.getScore(game).getScore();
      } else {
        return 0.0;
      }
    }).reduce(0.00, (a, b) -> a + b);
  }

  /**
   * Obtiene el total de juegos ganados por el Jugador
   *
   * @param player
   * @return Long
   */
  private Long winGamesPlayer(Player player) {

    return repoGame.findAll().stream().filter(game -> {

      if (player.getScore(game) != null) {
        return player.getScore(game).getScore() == 1;
      } else {
        return false;
      }

    }).count();
  }

  /**
   * Obtiene el total de juegos perdidos por el Jugador
   *
   * @param player
   * @return Long
   */
  private Long loseGamesPlayer(Player player) {

    return repoGame.findAll().stream().filter(game -> {

      if (player.getScore(game) != null) {
        return player.getScore(game).getScore() == 0;
      } else {
        return false;
      }

    }).count();
  }

  /**
   * Obtiene el total de juegos perdidos por el Jugador
   *
   * @param player
   * @return
   */
  private Long tieGamesPlayer(Player player) {

    return repoGame.findAll().stream().filter(game -> {

      if (player.getScore(game) != null) {
        return player.getScore(game).getScore() == 0.5;
      } else {
        return false;
      }

    }).count();
  }

  /**
   * Obtiene un DTO con informacion del GAME
   *
   * @param game
   * @return Map
   */
  private Map<String, Object> GameDTO(Game game) {

    Map<String, Object> dto = new LinkedHashMap<>();
    dto.put("id", game.getId());
    dto.put("created", game.getCreationDate());
    dto.put("gamePlayer", game.gamePlayers.stream().map(gamePlayer -> GamePlayersDTO(gamePlayer)).collect(Collectors.toList()));
    return dto;
  }

  /**
   * Obtiene un DTO con informacion del GAMEPLAYER
   *
   * @param gamePlayer
   * @return Map
   */
  private Map<String, Object> GamePlayersDTO(GamePlayer gamePlayer) {

    Map<String, Object> dto = new LinkedHashMap<>();
    //dto.put("id", gamePlayer.getId());
    dto.put("Player", PlayersDTO(gamePlayer.getPlayer(), gamePlayer.getId()));

    if (gamePlayer.getScore() != null) {
      dto.put("Score", gamePlayer.getScore().getScore());
    }

    return dto;
  }

  /**
   * Obtiene un DTO con informacion del PLAYER
   *
   * @param player
   * @param gpid
   * @return Map
   */
  private Map<String, Object> PlayersDTO(Player player, Long gpid) {

    Map<String, Object> dto = new LinkedHashMap<>();
    dto.put("gpid", gpid);
    dto.put("id", player.getId());
    dto.put("email", player.getUserName());
    return dto;
  }

  /**
   * Obtiene un DTO con informacion de SHIPS
   *
   * @param ship
   * @return Map
   */
  private Map<String, Object> ShipDTO(Ship ship) {

    Map<String, Object> dto = new LinkedHashMap<>();
    dto.put("type", ship.getShipType());
    dto.put("locations", ship.getLocations());
    return dto;
  }

  /**
   * Obtiene una lista de SALVOS de cada GAMEPLAYER y su turno
   *
   * @param gamePlayer
   * @return List Maps
   */
  private List<Map<String, Object>> SalvoDTO(GamePlayer gamePlayer) {

    List<Map<String, Object>> lsalvo = new ArrayList<>();

    gamePlayer.getGame().gamePlayers.forEach(gamePlayer1 -> {
      //Recorrer la lista Salvoes
      gamePlayer1.getSalvoes().forEach(salvo -> {
        Map<String, Object> salvoDto = new LinkedHashMap<>();
        salvoDto.put("turn", salvo.getTurn());
        salvoDto.put("player", gamePlayer1.getPlayer().getId());
        salvoDto.put("locations", salvo.getLocations());
        lsalvo.add(salvoDto);
      });
    });

    return lsalvo;
  }

  /**
   * Obtiene el API del GAMEPLAYER indicado
   *
   * @param gamePlayerId
   * @param authentication
   * @return ResponseEntity
   */
  @RequestMapping("/game_view/{gamePlayerId}")
  public ResponseEntity<Map<String, Object>> getGameView(@PathVariable Long gamePlayerId, Authentication authentication) {

    System.out.println("getGameView ---> ");
    Map<String, Object> dto;


    // 1.- ID del Player que esta logueado en sesion
    Long idAut = (getPlayerLogin(authentication) == null ? 0 : getPlayerLogin(authentication).getId());

    //Seleccionamos el GAMEPLAYER del repositorio con el identificador
    GamePlayer gamePlayer = repoGamePlayer.findOne(gamePlayerId);

    if (validarViewGameplayer(idAut, gamePlayer)) {

      dto = GameDTO(gamePlayer.getGame());
      dto.put("ships", gamePlayer.getShips().stream().map(ship -> ShipDTO(ship)).collect(Collectors.toList()));
      dto.put("salvoes", SalvoDTO(gamePlayer));

      Map<String, Object> dtoHistory = new LinkedHashMap<>();
      List<Map<String, Object>> lhist = getDtoTurnHits(gamePlayer);
      dtoHistory.put("history", lhist);
      dto.put("historyHits", dtoHistory);

      // Validar si el Juego a terminado y actualizamos el repositorio
      Integer go = validarGameOver(lhist, gamePlayer);
      dto.put("stateGame", getStateGame(idAut, gamePlayer, go));

      return new ResponseEntity<>(makeMapCUP("gameView", dto), HttpStatus.ACCEPTED);
    } else {
      return new ResponseEntity<>(makeMapCUP("error", "Game view no authorized"), HttpStatus.UNAUTHORIZED);
    }

  }

  // Obtenemos la lista historia hits por turnos de ships vs salvos de los jugadores

  /**
   * Obtiene la lista de la historia HITS/SINKS
   *
   * @param gamePlayer
   * @return LIST Maps
   */
  private List<Map<String, Object>> getDtoTurnHits(GamePlayer gamePlayer) {

    List<Map<String, Object>> listHistory = new ArrayList<>();

    // Lista de SHIPS/SALVOS de los GamePlayers
    //********************************************
    List<Ship> lshipLocal = new ArrayList<>();
    List<Ship> lshipOppon = new ArrayList<>();
    List<Salvo> lsalvoLocal = new ArrayList<>();
    List<Salvo> lsalvoOppon = new ArrayList<>();

    // 1.- Obtenemos los Gameplayers que participan en el Juego -> a traves del id gameplayer
    //****************************************************************************************
    List<GamePlayer> lgpLocal = gamePlayer.getGame().gamePlayers.stream().filter(gp1 -> gp1.getId() == gamePlayer.getId()).collect(toList());
    List<GamePlayer> lgpOppon = gamePlayer.getGame().gamePlayers.stream().filter(gp1 -> gp1.getId() != gamePlayer.getId()).collect(toList());

    // 2.- Nos guardamos las listas de los SHIPS/SALVOS.
    //****************************************************************
    if (!lgpLocal.isEmpty()) {
      lshipLocal = lgpLocal.get(0).getShips();
      lsalvoLocal = lgpLocal.get(0).getSalvoes();
    }
    if (!lgpOppon.isEmpty()) {
      lshipOppon = lgpOppon.get(0).getShips();
      lsalvoOppon = lgpOppon.get(0).getSalvoes();
    }

    // Unimos las listas de salvos para obtener el turno mas grande
    //****************************************************************
    List<Salvo> lSalvoJoin = new ArrayList<>();
    lSalvoJoin.addAll(lsalvoLocal);
    lSalvoJoin.addAll(lsalvoOppon);

    // 3.- Nos guardamos el numero de salvos mas grande -> representa el turno por donde van.
    //************************************************************************************************
    long turnGame = lSalvoJoin.stream().mapToLong(salvo -> salvo.getTurn()).max().orElse(-1);

    Map<String, Integer> sumShipL = new LinkedHashMap<>();
    Map<String, Integer> sumShipO = new LinkedHashMap<>();
    sumShipL.put("left", lshipLocal.size());
    sumShipO.put("left", lshipOppon.size());

    // 4.- Por cada turno nos guardamos el historial del Juego
    //***********************************************************************
    for (int i = 0; i < turnGame; i++) {

      int turn = (i + 1);
      Map<String, Object> dto = new LinkedHashMap<>();
      dto.put("turn", turn);
      List<Map<String, Object>> ll = new ArrayList<>();
      List<Map<String, Object>> lo = new ArrayList<>();

      // lista SHIPS con sus HITS
      ll = getDtoHistory(lshipLocal, lsalvoOppon.stream().filter(salvo -> salvo.getTurn() == turn).collect(toList()));
      lo = getDtoHistory(lshipOppon, lsalvoLocal.stream().filter(salvo -> salvo.getTurn() == turn).collect(toList()));
      sumShipL = obtenerShipsRestantes(ll, sumShipL);
      sumShipO = obtenerShipsRestantes(lo, sumShipO);

      // Map informacion historia HITS/SKUN
      dto.put("local", ll);
      dto.put("leftL", sumShipL.get("left"));
      dto.put("opponent", lo);
      dto.put("leftO", sumShipO.get("left"));
      listHistory.add(dto);
    }

    return listHistory;
  }

  /**
   * Obtiene la lista de HITS del gameplayer view y su opponente
   *
   * @param ships
   * @param salvos
   * @return LIST Maps
   */
  private List<Map<String, Object>> getDtoHistory(List<Ship> ships, List<Salvo> salvos) {

    List<Map<String, Object>> lobj = new ArrayList<>();

    // Recorremos todos las localizaciones de los SHIPS para comparar con los Salvos
    ships.forEach(ship -> {

      // Solo si tenemos Salvos para comparar con SHIPS
      if (!salvos.isEmpty()) {
        Map<String, Object> dto = new LinkedHashMap<>();
        // Nos guardamos los ships que han estado touch
        int numHitsShip = getHitsShip(ship.getLocations(), salvos.get(0).getLocations());
        if (numHitsShip > 0) {
          dto.put(ship.getShipType(), numHitsShip);
          lobj.add(dto);
        }
      }
    });

    return lobj;
  }

  // Determina el numero de HITS de SHIP/SALVOS

  /**
   * Obtiene el numero de HITS del gameview sobre los salvos opponent
   *
   * @param lships
   * @param lsalvo
   * @return Integer
   */
  private Integer getHitsShip(List<String> lships, List<String> lsalvo) {

    int numHits = 0;
    for (String shipPos : lships) {
      for (String salvoPos : lsalvo) {
        if (shipPos.equals(salvoPos)) {
          numHits++;
        }
      }
    }

    return numHits;
  }

  @RequestMapping(path = "/players", method = RequestMethod.POST)
  public ResponseEntity<Map<String, Object>> createUserPlayer(@RequestParam("username") String usr, @RequestParam("password") String pwd) {

    System.out.println("createUserPlayer: " + usr);

    // 1.- Validar si el Player ya existe en Repository
    List<Player> players = repoPlayer.findByUserName(usr);
    if (!players.isEmpty()) {
      return new ResponseEntity<>(makeMapCUP("error", "Name in use"), HttpStatus.FORBIDDEN);
    }

    // 2.- Creamos el usuario + insertar Repository
    Player player = new Player(usr, pwd);
    repoPlayer.save(player);
    return new ResponseEntity<>(makeMapCUP("userName", usr), HttpStatus.CREATED);

  }

  @RequestMapping(path = "/games", method = RequestMethod.POST)
  public ResponseEntity<Map<String, Object>> createGame(Authentication authentication) {

    System.out.println("createGame ---> ");
    Map<String, Object> dto = new LinkedHashMap<>();

    // 1.- Obtenemos el id del usuario de sesion LOGIN
    Long idAut = (getPlayerLogin(authentication) == null ? 0 : getPlayerLogin(authentication).getId());

    // 2.- Si no hay usuario enviamos respuesta no Autorizada
    //     Si existe usuario creamos GAME y vinculamos al PLAYER
    if (idAut == 0) {
      return new ResponseEntity<>(makeMapCUP("error", "No authorized create Game"), HttpStatus.UNAUTHORIZED);
    } else {

      // Creamos un nuevo GAME y save to repository
      Game game = new Game();
      repoGame.save(game);

      // Creamos un nuevo GAMEPLAYER para vincular GAME vs PLAYER
      GamePlayer gamePlayer = new GamePlayer(getPlayerLogin(authentication), game);
      repoGamePlayer.save(gamePlayer);

      // Cramos respuesta Entity
      dto.put("gamePlayerId", gamePlayer.getId());
      return new ResponseEntity<>(makeMapCUP("createGame", dto), HttpStatus.ACCEPTED);
    }
  }

  @RequestMapping(path = "/game/{gameId}/players", method = RequestMethod.POST)
  public ResponseEntity<Map<String, Object>> joinPlayerGame(@PathVariable Long gameId, Authentication authentication) {

    System.out.println("joinPlayerGame --> ");
    Map<String, Object> dto = new LinkedHashMap<>();

    // 1.- Obtenemos el id del usuario de sesion LOGIN
    Long idAut = (getPlayerLogin(authentication) == null ? 0 : getPlayerLogin(authentication).getId());
    System.out.println("idAut: " + idAut);

    // 2.- Si no hay usuario enviamos respuesta no Autorizada
    //     Si existe usuario vinculamos GAME to PLAYER
    if (idAut == 0) {
      return new ResponseEntity<>(makeMapCUP("error", "No authorized join Game"), HttpStatus.UNAUTHORIZED);
    } else {

      // 3.- Obtenemos el GAME of repository
      Game game = repoGame.findOne(gameId);

      if (game == null) {
        return new ResponseEntity<>(makeMapCUP("error", "No such game"), HttpStatus.FORBIDDEN);
      } else {
        // 4.- Validar que el GAME only one Player
        if (game.getPlayers().stream().filter(player -> player.getId() > 0).count() > 1) {
          return new ResponseEntity<>(makeMapCUP("error", "Game is full"), HttpStatus.FORBIDDEN);
        } else {

          //Obtenemos el id del Player que tenemos en el Juego para que no sea el mismo que el
          // realiza el Join
          List<Long> playersId = game.getPlayers().stream().map(player -> player.getId()).collect(toList());
          System.out.println("playersId: " + playersId);

          if (playersId.get(0) == idAut) {
            return new ResponseEntity<>(makeMapCUP("error", "Gameplayer is de Same to Join GAME"), HttpStatus.FORBIDDEN);
          } else {
            // Creamos un new GAMEPLAYER para asociar PLAYER with GAME
            GamePlayer gamePlayer = new GamePlayer(getPlayerLogin(authentication), game);
            repoGamePlayer.save(gamePlayer);

            //Creamos respuesta JSON
            dto.put("gamePlayerId", gamePlayer.getId());
            return new ResponseEntity<>(makeMapCUP("joinGame", dto), HttpStatus.ACCEPTED);
          }
        }
      }
    }
  }

  @RequestMapping(path = "/games/players/{gamePlayerId}/ships", method = RequestMethod.POST)
  public ResponseEntity<Map<String, Object>> addShips(@PathVariable Long gamePlayerId, @RequestBody List<Ship> lship, Authentication authentication) {

    System.out.println(" (xx) addShips --> ");

    // 1.- Obtenemos el id del usuario de sesion LOGIN
    Long idAut = (getPlayerLogin(authentication) == null ? 0 : getPlayerLogin(authentication).getId());
    System.out.println("idAut: " + idAut);

    // 2.- Si no hay usuario enviamos respuesta no Autorizada
    //     Si existe usuario vinculamos SHIPS to PLAYER
    if (idAut == 0) {
      return new ResponseEntity<>(makeMapCUP("error", "not game player" + gamePlayerId), HttpStatus.UNAUTHORIZED);
    } else {

      //Seleccionamos el GAMEPLAYER del repositorio con el identificador
      System.out.println("gamePlayerId: " + gamePlayerId);
      GamePlayer gamePlayer = repoGamePlayer.findOne(gamePlayerId);
      System.out.println("game: " + gamePlayer.getGame().getId());
      System.out.println("player: " + gamePlayer.getPlayer().getId());

      // 3.- El gameplayer no es el Player del Juego
      if (!validarViewGameplayer(idAut, gamePlayer)) {
        return new ResponseEntity<>(makeMapCUP("error", "Game view no authorized"), HttpStatus.UNAUTHORIZED);
      } else {

        List<Ship> ships = gamePlayer.getShips();
        System.out.println("ships gameplayer: " + ships.toString());

        // 4.- Validar si el GAMEPLAYER ya tiene SHIPS vinculados
        if (!ships.isEmpty()) {
          return new ResponseEntity<>(makeMapCUP("error", "user already has ships placed"), HttpStatus.FORBIDDEN);
        } else {

          // a.- Recorremos la lista de ships + locations
          for (Ship ship : lship) {
            System.out.println(ship);
            Ship sh = new Ship();
            sh.setShipType(ship.getShipType());
            sh.setLocations(ship.getLocations());
            gamePlayer.addShip(sh);
            repoShip.save(sh);
          }

          // 5.- Tratamiento vincular SHIPS to PLAYER
          return new ResponseEntity<>(makeMapCUP("addShips", "Ships cheated"), HttpStatus.CREATED);
        }
      }
    }
  }

  @RequestMapping(path = "/games/players/{gamePlayerId}/salvos", method = RequestMethod.POST)
  public ResponseEntity<Map<String, Object>> addSalvos(@PathVariable Long gamePlayerId, @RequestBody Salvo
          salvo, Authentication authentication) {

    System.out.println(" (zz) addSalvos --> ");
    //********************************************************************************
    //**** ojo falta controlar la raja SHOTS cuando el estado finalizar juego!!!!!!!
    //**** ojo falta controlar la raja SHOTS cuando el estado finalizar juego!!!!!!!
    //**** ojo falta controlar la raja SHOTS cuando el estado finalizar juego!!!!!!!
    //********************************************************************************

    // 1.- Obtenemos el id del usuario de sesion LOGIN
    Long idAut = (getPlayerLogin(authentication) == null ? 0 : getPlayerLogin(authentication).getId());
    System.out.println("idAut: " + idAut);

    // 2.- Si no hay usuario enviamos respuesta no Autorizada
    if (idAut == 0) {
      return new ResponseEntity<>(makeMapCUP("error", "not game player" + gamePlayerId), HttpStatus.UNAUTHORIZED);
    } else {

      //Seleccionamos el GAMEPLAYER del repositorio con el identificador
      System.out.println("gamePlayerId: " + gamePlayerId);
      GamePlayer gamePlayer = repoGamePlayer.findOne(gamePlayerId);
      System.out.println("game: " + gamePlayer.getGame().getId());
      System.out.println("player: " + gamePlayer.getPlayer().getId());

      Long idPlayerGame = gamePlayer.getGame().getPlayers().stream().filter(player -> player.getId() == idAut).collect(Collectors.counting());
      System.out.println("idPlayerGame: " + idPlayerGame);

      // 3.- El gameplayer no es el Player del Juego
      if (!validarViewGameplayer(idAut, gamePlayer) || idPlayerGame != 1) {
        return new ResponseEntity<>(makeMapCUP("error", "Game view no authorized"), HttpStatus.UNAUTHORIZED);
      } else {

        // 4.- Recuperamos los salvos del Jugador
        List<Salvo> salvos = gamePlayer.getSalvoes();
        System.out.println("Salvos gameplayer: " + salvos.toString());
        System.out.println(" Salvo ---> :" + salvo.getTurn());

        // Error si envian mas de 5 salvos por rafaga
        if (salvo.getLocations().size() > 5) {
          return new ResponseEntity<>(makeMapCUP("error", "A player firing a salvo with more than 5 shots"), HttpStatus.FORBIDDEN);
        } else {
          // Filtramos para saber si el turno que nos han enviado no lo tenemos repetido ya en el GAMEPLAYER
          Long turnRepeat = salvos.stream().filter(salvo1 -> salvo1.getTurn() == salvo.getTurn()).collect(Collectors.counting());
          System.out.println("tunrRepeat: " + turnRepeat);

          if (turnRepeat > 0) {
            return new ResponseEntity<>(makeMapCUP("error", "player firing a salvo more than once per turn"), HttpStatus.FORBIDDEN);
          } else {

            // 5.- Tratamiento vincular SALVOS to GAMEPLAYR
            gamePlayer.addSalvoes(salvo);
            repoSalvo.save(salvo);

            return new ResponseEntity<>(makeMapCUP("addSalvos", "Salvos save"), HttpStatus.CREATED);
          }
        }
      }
    }
  }

  /**
   * Obtenemos el Player que esta logueado en el Juego.
   *
   * @param authentication
   * @return Player
   */
  private Player getPlayerLogin(Authentication authentication) {

    List<Player> listPlayerLogin = new ArrayList<>();

    // List players login
    if (authentication != null) {
      listPlayerLogin = repoPlayer.findAll()
              .stream()
              .filter(player -> player.getUserName().equals(authentication.getName()))
              .collect(toList());
    }

    // Get player authentication
    if (listPlayerLogin.isEmpty()) {
      return null;
    } else {
      return listPlayerLogin.get(0);
    }

  }

  private Map<String, Object> makeMapCUP(String key, Object value) {
    Map<String, Object> mapRE = new HashMap<>();
    mapRE.put(key, value);
    return mapRE;
  }

  /**
   * Valida que el Player sea el mismo del Juego que el Logueado
   *
   * @param idaAut
   * @param gamePlayer
   * @return boolean
   */
  private Boolean validarViewGameplayer(Long idaAut, GamePlayer gamePlayer) {
    return gamePlayer.getPlayer().getId() == idaAut;
  }

  /**
   * Obtenemos el estado en el que se encuentra el GAME.
   *
   * @param idaAut
   * @param gamePlayer
   * @param gameOver
   * @return Map datos estado del GAME
   */
  private Map<String, Object> getStateGame(Long idaAut, GamePlayer gamePlayer, Integer gameOver) {

    Map<String, Object> dtoState = new LinkedHashMap<>();

    //Recuperamos el siguiente GAMEPLAYER
    List<GamePlayer> lgp = gamePlayer.getGame().gamePlayers.stream().filter(gp1 -> gp1.getPlayer().getId() != idaAut).collect(toList());

    // GAMEPLAYER - LOGUIN - WHITHOUT SHIPS
    //*****************************************
    if (gamePlayer.getShips().isEmpty()) {
      dtoState.put("state", 2);
      dtoState.put("msg", "Place SHIPS");
    } else {

      // GAME WITHOUT OPPONENT
      //****************************************
      if (lgp.isEmpty()) {
        dtoState.put("state", 1);
        dtoState.put("msg", "Juego sin oponente, espere para Jugar");
      } else {
        //Comprobar gameplayer PLACE SHIPS
        //***********************************
        if (lgp.get(0).getShips().isEmpty()) {
          dtoState.put("state", 3);
          dtoState.put("msg", "Oponente sin SHIPS en la GRID");
        } else {
          if (gamePlayer.getSalvoes().isEmpty() && lgp.get(0).getSalvoes().isEmpty()) {
            dtoState.put("state", 4);
            dtoState.put("msg", " Enter Salvo");
          } else {
            // 1.- Validar si partida se ha acabado
            if (gameOver != 0) {
              dtoState.put("state", 6);
              dtoState.put("msg", "GAME OVER " + playerWin(gameOver));
            } else {
              // 2.- Determinar el turno de disparo y si los gameplayers han disparado sus salvos en el mismo turno
              if (lastTurnSalvos(gamePlayer, lgp.get(0)) == 0) {
                // Los dos GAMEPLAYERS pueden disparar
                dtoState.put("state", 4);
                dtoState.put("msg", "Enter Salvo");
              } else if (lastTurnSalvos(gamePlayer, lgp.get(0)) == gamePlayer.getId()) {

                // Dispara el GAMEPLAYER con el id que le toca
                dtoState.put("state", 4);
                dtoState.put("msg", "Enter Salvo");
              } else {

                // El otro GAMEPLAYER le toca esperar
                dtoState.put("state", 5);
                dtoState.put("msg", "Wait");
              }
            }
          }
        }
      }
    }

    return dtoState;
  }

  /**
   * Obtenemos el ID del GAMEPLAYER que le toca disparar
   *
   * @param gp1
   * @param gp2
   * @return
   */
  private Long lastTurnSalvos(GamePlayer gp1, GamePlayer gp2) {

    long idGpShoot = 0;
    long turnGp1 = 0;
    long turnGp2 = 0;

    // Obtener turno del GAMEPLAYER 1
    if (!gp1.getSalvoes().isEmpty()) {
      List<Salvo> lsalvo_gp1 = gp1.getSalvoes().stream().sorted(Comparator.comparing(Salvo::getTurn)).collect(toList());
      turnGp1 = lsalvo_gp1.get(lsalvo_gp1.size() - 1).getTurn();
    }

    // Obtener turno del GAMEPLAYER 2
    if (!gp2.getSalvoes().isEmpty()) {
      List<Salvo> lsalvo_gp2 = gp2.getSalvoes().stream().sorted(Comparator.comparing(Salvo::getTurn)).collect(toList());
      turnGp2 = lsalvo_gp2.get(lsalvo_gp2.size() - 1).getTurn();
    }

    if (turnGp1 > turnGp2) {
      idGpShoot = gp2.getId();
    } else if (turnGp1 < turnGp2) {
      idGpShoot = gp1.getId();
    } else {
      idGpShoot = 0;
    }

    return idGpShoot;
  }

  private Map<String, Integer> obtenerShipsRestantes(List<Map<String, Object>> lista, Map<String, Integer> numSkun) {

    System.out.println("numSkun: " + numSkun);
    // 1.- Comprobar cuantos Ships estan hundidos
    lista.forEach(obj -> {
      for (String key : obj.keySet()) {

        // Nos guardamos el type Ship + sus hits
        numSkun.put(key, ((int) obj.get(key) + (numSkun.get(key) == null ? 0 : numSkun.get(key))));

        // Comprobamos si se ha hundido
        if (lonTypeShip(key) == numSkun.get(key)) {
          numSkun.put("left", (numSkun.get("left") - 1));
        }
      }
    });

    System.out.println(numSkun);

    // 2.- Restar cantidad barcos con los hundidos
    return numSkun;

  }

  /**
   * Obtenemos la longitud que ocupa el barco en el grid.
   * Podemos saber si se el barco ha sido hundido.
   *
   * @param keyShip
   * @return Integer
   */
  private Integer lonTypeShip(String keyShip) {

    Integer lonShig = 0;

    switch (keyShip) {
      case "Carrier":
        lonShig = 5;
        break;
      case "Battleship":
        lonShig = 4;
        break;
      case "Submarine":
        lonShig = 3;
        break;
      case "Destroyer":
        lonShig = 3;
        break;
      case "Patrol Boat":
        lonShig = 2;
        break;
      default:
        lonShig = 0;
        break;
    }
    return lonShig;
  }

  private Integer validarGameOver(List<Map<String, Object>> lista, GamePlayer gameplayer) {

    System.out.println("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    double scoreLocal = 0;
    double scoreOppon = 0;
    long turnLocal = 0;
    long turnOppon = 0;

    // 1.- Obtenemos los Gameplayers que participan en el Juego -> a traves del id gameplayer
    //****************************************************************************************
    List<GamePlayer> lgpOppon = gameplayer.getGame().gamePlayers.stream().filter(gp1 -> gp1.getId() != gameplayer.getId()).collect(toList());
    if (!lgpOppon.isEmpty()) {
      GamePlayer gpOppon = lgpOppon.get(0);
      turnOppon = gpOppon.getSalvoes().stream().mapToLong(salvo -> salvo.getTurn()).max().orElse(-1);
    }

    turnLocal = gameplayer.getSalvoes().stream().mapToLong(salvo -> salvo.getTurn()).max().orElse(-1);
    System.out.println(turnLocal + "::::" + turnOppon);
    Integer gameOver = 0;

    Map<String, Integer> mapGameOver = new LinkedHashMap<>();

    if (!lista.isEmpty()) {
      lista.forEach(o1 -> {
        System.out.println(o1.get("turn"));
        System.out.println(o1.get("leftL"));
        System.out.println(o1.get("leftO"));
        mapGameOver.put("turn", (int) o1.get("turn"));
        mapGameOver.put("leftL", (int) o1.get("leftL"));
        mapGameOver.put("leftO", (int) o1.get("leftO"));
      });
    }

    // Falta controlar que los dos turnos sean iguales.
    if (!mapGameOver.isEmpty()) {

      // Solo validar si nos encontramos en el mismo turno
      if (turnLocal == turnOppon) {
        // Empate --> mismo turno sin barcos
        if (mapGameOver.get("leftL") == 0 && mapGameOver.get("leftO") == 0) {
          scoreLocal = 0.5;
          scoreOppon = 0.5;
          gameOver = 3;
        } else if (mapGameOver.get("leftL") == 0 && mapGameOver.get("leftO") != 0) {
          scoreLocal = 0;
          scoreOppon = 1;
          gameOver = 2;
        } else if (mapGameOver.get("leftL") != 0 && mapGameOver.get("leftO") == 0) {
          scoreLocal = 1;
          scoreOppon = 0;
          gameOver = 1;
        } else {
          gameOver = 0;
        }
      }
    }

    //Actualizamos el repositorio scores si el Juego a terminado
    if (gameOver != 0) {

      // Si ya tenemos score en el Gameplayer no lo actualizamos
      System.out.println("game Id: " + gameplayer.getGame().getId());
      System.out.println("game Player Id: " + gameplayer.getPlayer().getId());

      // Solo actualizamos repository si los dos players no tiene score
      if (gameplayer.getPlayer().getScore(gameplayer.getGame()) == null &&
              lgpOppon.get(0).getPlayer().getScore(lgpOppon.get(0).getGame()) == null) {
        GamePlayer gp = lgpOppon.get(0);
        Score scg1 = new Score(scoreLocal, gameplayer.getPlayer(), gameplayer.getGame());
        Score scg2 = new Score(scoreOppon, gp.getPlayer(), gameplayer.getGame());
        Date dateGameOver = new Date();

        //Añadir Juegos, Jugadores y puntuacion si ha acabado el Juego.
        scg1.setFinishDate(dateGameOver);
        scg2.setFinishDate(dateGameOver);

        repoScore.save(scg1);
        repoScore.save(scg2);
      }
    }

    return gameOver;
  }

  private String playerWin(Integer puntuacion) {

    System.out.println("----->>>>>>> " + puntuacion);
    String litWin = "";

    if (puntuacion == 1) {
      litWin = "You Win !!!!";
    }

    if (puntuacion == 2) {
      litWin = "You Lose !!!!";
    }

    if (puntuacion == 3) {
      litWin = "You Tie !!!!";
    }

    return litWin;

  }

}