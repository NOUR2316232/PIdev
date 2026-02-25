package esprit.clinicalservice.entities.enums;

public enum TriageLevel {
    RED(1),
    ORANGE(2),
    YELLOW(3),
    GREEN(4);

    private final int priorityRank;

    TriageLevel(int priorityRank) {
        this.priorityRank = priorityRank;
    }

    public int getPriorityRank() {
        return priorityRank;
    }
}
