package edu.universidad.sdu.campus;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/campuses")
public class CampusController {

    private final CampusRepository campusRepository;

    public CampusController(CampusRepository campusRepository) {
        this.campusRepository = campusRepository;
    }

    @GetMapping
    public List<CampusResponse> getCampuses() {
        return campusRepository.findAllByOrderByNameAsc().stream()
                .map(campus -> new CampusResponse(campus.getId(), campus.getName()))
                .toList();
    }

    public record CampusResponse(Long id, String name) {
    }
}
