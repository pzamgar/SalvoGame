package com.salvo.salvo;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {

  @RequestMapping("/")
  public String homePage() {
    return "redirect:/web/index.html";
  }
}
