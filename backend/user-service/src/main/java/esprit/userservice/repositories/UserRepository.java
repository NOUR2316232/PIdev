package esprit.userservice.repositories;


import esprit.userservice.entities.User;
import esprit.userservice.entities.enums.Role;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    // Used for login to find user by username
    Optional<User> findByUsername(String username);
    // Used for register to check duplicates
    Boolean existsByUsername(String username);

    @Query("SELECT u.id FROM User u WHERE u.role = :role ORDER BY u.id")
    List<Long> findIdsByRole(Role role);
}
