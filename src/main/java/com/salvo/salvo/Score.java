package com.salvo.salvo;

import javax.persistence.*;
import java.util.Date;

@Entity
public class Score {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long id;
  private double score;
  @Column(name="finish_date")
  private Date finishDate;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "player_id")
  private Player player;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "game_id")
  private Game game;

  public Score() {
  }

  public Score(double score, Player player, Game game) {
    this.score = score;
    this.player = player;
    this.game = game;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public double getScore() {
    return score;
  }

  public void setScore(int score) {
    this.score = score;
  }

  public Date getFinishDate() {
    return finishDate;
  }

  public void setFinishDate(Date finishDate) {
    this.finishDate = finishDate;
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

  public void incrFinishDateXhours(Integer x) {
    this.finishDate = Date.from(this.finishDate.toInstant().plusSeconds(3600 * x));
  }

  @Override
  public String toString() {
    return "Score{" +
            "id=" + id +
            ", score=" + score +
            ", finishDate=" + finishDate +
            ", player=" + player +
            ", game=" + game +
            '}';
  }
}
