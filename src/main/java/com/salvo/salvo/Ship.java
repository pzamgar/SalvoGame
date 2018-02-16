package com.salvo.salvo;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Ship {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private long  id;
  private String shipType;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "gamePlayer_id")
  private GamePlayer gamePlayer;

  @ElementCollection
  @Column(name="location")
  private List<String> locations = new ArrayList<>();

  public Ship() {
  }

  public Ship(String shipType) {
    this.shipType = shipType;
  }

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public String getShipType() {
    return shipType;
  }

  public void setShipType(String shipType) {
    this.shipType = shipType;
  }

  public GamePlayer getGamePlayer() {
    return gamePlayer;
  }

  public void setGamePlayer(GamePlayer gamePlayer) {
    this.gamePlayer = gamePlayer;
  }

  public List<String> getLocations() {
    return locations;
  }

  public void setLocations(List<String> locations) {
    this.locations = locations;
  }

  @Override
  public String toString() {
    return "Ship{" +
            "id=" + id +
            ", shipType='" + shipType + '\'' +
            ", gamePlayer=" + gamePlayer +
            ", locations=" + locations +
            '}';
  }
}
