package edu.universidad.sdu.campus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "sedes")
public class Campus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sede")
    private Long id;

    @Column(name = "nombre_sede", nullable = false, length = 100)
    private String name;

    protected Campus() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
