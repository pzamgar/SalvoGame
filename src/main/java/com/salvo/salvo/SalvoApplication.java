package com.salvo.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configurers.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

@SpringBootApplication
public class SalvoApplication {

  public static void main(String[] args) {
    SpringApplication.run(SalvoApplication.class, args);
  }

  @Bean
  public CommandLineRunner initData() {

    return (args) -> {
    };
  }

}

/*
Permite obtener los datos de los usuarios y sus permisos
 */
@Configuration
class WebSecurityConfiguration extends GlobalAuthenticationConfigurerAdapter {

  @Autowired
  PlayerRepository playerRepository;

  @Override
  public void init(AuthenticationManagerBuilder auth) throws Exception {
    auth.userDetailsService(userDetailsService());
  }

  @Bean
  UserDetailsService userDetailsService() {
    return new UserDetailsService() {

      @Override
      public UserDetails loadUserByUsername(String name) throws UsernameNotFoundException {

        //Busqueda del nombre en el repositorio
        List<Player> players = playerRepository.findByUserName(name);

        if (!players.isEmpty()) {
          Player player = players.get(0);
          System.out.println("Player login: " + player);
          return new User(player.getUserName(), player.getPassword(), AuthorityUtils.createAuthorityList("USER"));
        } else {
          throw new UsernameNotFoundException("Unknown user: " + name);
        }
      }
    };
  }
}


/*
Configuracion de las url con permisos para la aplicacion
 */
@EnableWebSecurity
@Configuration
class WebSecurityConfig extends WebSecurityConfigurerAdapter {

  //Reglas de autentificacion en el protocolo HTTP
  @Override
  protected void configure(HttpSecurity http) throws Exception {

    http.authorizeRequests()
            .antMatchers("/").permitAll()
            .antMatchers("/web/index.html").permitAll()
            .antMatchers("/web/credits.html").permitAll()
            .antMatchers("/web/rules.html").permitAll()
            .antMatchers("/web/404.html","/web/401.html").permitAll()
            .antMatchers("/web/scripts/**").permitAll()
            .antMatchers("/web/styles/**").permitAll()
            .antMatchers("/web/img/**").permitAll()
            .antMatchers("/api/games").permitAll()
            .antMatchers("/api/players").permitAll()
            .antMatchers("/favicon.ico").permitAll()
            .antMatchers("/rest/*").denyAll()
            .anyRequest().authenticated()
            .and().csrf().disable().formLogin()
            .loginPage("/api/login").permitAll()
            .usernameParameter("username")
            .passwordParameter("password")
            .and()
            .logout().logoutUrl("/api/logout");

    // turn off checking for CSRF tokens
    http.csrf().disable();

    // if user is not authenticated, just send an authentication failure response
    http.exceptionHandling().authenticationEntryPoint((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

    // if login is successful, just clear the flags asking for authentication
    http.formLogin().successHandler((req, res, auth) -> clearAuthenticationAttributes(req));

    // if login fails, just send an authentication failure response
    http.formLogin().failureHandler((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

    // if logout is successful, just send a success response
    http.logout().logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler());
  }

  private void clearAuthenticationAttributes(HttpServletRequest request) {
    HttpSession session = request.getSession(false);
    if (session != null) {
      session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
    }

  }
}

