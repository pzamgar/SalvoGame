package com.salvo.salvo;


import javax.persistence.*;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
public class Game {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private long id;

  @Column(name = "creation_date")
  private Date creationDate = new Date();

  @OneToMany(mappedBy = "game", fetch = FetchType.EAGER)
  Set<GamePlayer> gamePlayers = new HashSet<>();

  @OneToMany(mappedBy = "game", fetch = FetchType.EAGER)
  Set<Score> scores = new HashSet<>();

  public Game() { }

  public Game(Date creationDate) {
    this.creationDate = creationDate;
  }

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public Date getCreationDate() {
    return creationDate;
  }

  public void setCreationDate(Date creationDate) {
    this.creationDate = creationDate;
  }


  public void addGamePlayer(GamePlayer gamePlayer) {
    gamePlayer.setGame(this);
    gamePlayers.add(gamePlayer);
  }

  public List<Player> getPlayers() {
    return gamePlayers.stream().map(player -> player.getPlayer()).collect(Collectors.toList());
  }

  public void addScores(Score score) {
    score.setGame(this);
    scores.add(score);
  }

  public void incrCreateDateXhours(Integer x) {
    this.creationDate = Date.from(this.creationDate.toInstant().plusSeconds(3600 * x));
  }

  @Override
  public String toString() {
    return "Game{" +
            "id=" + id +
            ", creationDate=" + creationDate +
            '}';
  }
}
