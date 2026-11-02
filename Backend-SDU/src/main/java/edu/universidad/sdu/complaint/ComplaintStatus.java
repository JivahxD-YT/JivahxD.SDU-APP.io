package edu.universidad.sdu.complaint;

public enum ComplaintStatus {
    REGISTRADA,
    ADMITIDA,
    RECHAZADA,
    PROCESANDO,
    PROCESADA;

    public boolean canTransitionTo(ComplaintStatus target) {
        if (this == target) {
            return true;
        }
        if (this == RECHAZADA || this == PROCESADA) {
            return false;
        }
        if (target == RECHAZADA) {
            return true;
        }
        return this.ordinal() < target.ordinal()
                || (this == REGISTRADA && target == ADMITIDA)
                || (this == ADMITIDA && (target == PROCESANDO || target == PROCESADA))
                || (this == PROCESANDO && target == PROCESADA);
    }
}
