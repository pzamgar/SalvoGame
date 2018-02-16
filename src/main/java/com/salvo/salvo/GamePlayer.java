package com.salvo.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.*;
import java.util.stream.Collectors;

@Entity
public class GamePlayer {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private long id;

  @Column(name = "join_date")
  private Date joinDate = new Date();

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "player_id")
  private Player player;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "game_id")
  private Game game;

  @OneToMany(mappedBy = "gamePlayer", fetch = FetchType.EAGER)
  Set<Ship> ships = new HashSet<>();

  @OneToMany(mappedBy = "gamePlayer", fetch = FetchType.EAGER)
  Set<Salvo> salvoes = new HashSet<>();

  public GamePlayer() { }

  public GamePlayer(Player player, Game game) {
    this.player = player;
    this.game = game;
  }

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public Date getJoinDate() {
    return joinDate;
  }

  public void setJoinDate(Date joinDate) {
    this.joinDate = joinDate;
  }

  public Player getPlayer() {
    return player;
  }

  public void setPlayer(Player player) {
    this.player = player;
  }

  public Game getGame() {
    return game;
  }

  public void setGame(Game game) {
    this.game = game;
  }

  public void addShip(Ship ship) {
    ship.setGamePlayer(this);
    ships.add(ship);
  }

  @JsonIgnore
  public List<Ship> getShips() {
    return ships.stream().collect(Collectors.toList());
  }

  public void addSalvoes(Salvo salvo) {
    salvo.setGamePlayer(this);
    salvoes.add(salvo);
  }

  @JsonIgnore
  public List<Salvo> getSalvoes() {
    return salvoes.stream().collect(Collectors.toList());
  }

  public Score getScore() {
    return player.getScore(game);
  }

  public void incrDateJoinXhours(Integer x) {
    this.joinDate = Date.from(this.joinDate.toInstant().plusSeconds(3600 * x));
  }

}
