package edu.universidad.sdu.campus;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampusRepository extends JpaRepository<Campus, Long> {

    List<Campus> findAllByOrderByNameAsc();
}
