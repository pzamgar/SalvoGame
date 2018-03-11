package com.salvo.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
public class Player {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private long id;

  private String name;

  @Column(name = "user_name")
  private String userName;

  @JsonIgnore
  private String password;

  @OneToMany(mappedBy = "player", fetch = FetchType.EAGER)
  Set<GamePlayer> gamePlayers = new HashSet<>();

  @OneToMany(mappedBy = "player", fetch = FetchType.EAGER)
  Set<Score> scores = new HashSet<>();

  public Player() {
  }

  public Player(String userName) {
    this.userName = userName;
  }

  public Player(String name, String userName, String password) {
    this.name = name;
    this.userName = userName;
    this.password = password;
  }

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public String getUserName() {
    return userName;
  }

  public void setUserName(String userName) {
    this.userName = userName;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public void addGamePlayer(GamePlayer gamePlayer) {
    gamePlayer.setPlayer(this);
    gamePlayers.add(gamePlayer);
  }

  @JsonIgnore
  public List<Game> getGames() {
    return gamePlayers.stream().map(game -> game.getGame()).collect(Collectors.toList());
  }

  public void addScores(Score score) {
    score.setPlayer(this);
    scores.add(score);
  }

  //Metodo para obtener la puntuacion del Jugador en el Juego
  public Score getScore(Game game) {

    return scores.stream().filter(p -> p.getGame().getId() == game.getId()).findFirst().orElse(null);
  }

  public Set<Score> getScores() {
    return scores;
  }

  @Override
  public String toString() {
    return "Player{" +
            "id=" + id +
            ", name='" + name + '\'' +
            ", userName='" + userName + '\'' +
            '}';
  }
}
