package edu.universidad.sdu.complaint;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Page<Complaint> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
            select c.name as campusName, count(d.id) as complaintCount
            from Campus c left join Complaint d on d.campus = c
            group by c.id, c.name
            order by complaintCount desc, c.name
            """)
    List<CampusCount> countByCampus();

    @Query("""
            select d from Complaint d left join fetch d.campus
            where d.id = :id
            """)
    java.util.Optional<Complaint> findWithCampusById(@Param("id") Long id);

    @Query("""
            select d from Complaint d left join fetch d.campus
            where upper(d.trackingCode) = upper(:trackingCode)
            """)
    java.util.Optional<Complaint> findWithCampusByTrackingCode(
            @Param("trackingCode") String trackingCode);

    interface CampusCount {
        String getCampusName();

        long getComplaintCount();
    }
}
