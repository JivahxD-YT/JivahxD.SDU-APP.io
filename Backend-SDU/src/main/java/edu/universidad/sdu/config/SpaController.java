package edu.universidad.sdu.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {"/", "/{path:[^\\.]*}", "/{path:[^\\.]*}/**"})
    public String forwardToAngular() {
        return "forward:/index.html";
    }
}
