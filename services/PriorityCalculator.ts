// services/PriorityCalculator.ts

export interface PriorityParams {
  alpha?: number;  // Peso de importancia (default 0.6)
  beta?: number;   // Peso de urgencia (default 0.4)
  maxDays?: number; // Días máximos para urgencia (default 30)
}

export class PriorityCalculator {
  private static readonly DEFAULT_ALPHA = 0.6;
  private static readonly DEFAULT_BETA = 0.4;
  private static readonly DEFAULT_MAX_DAYS = 30;

  /**
   * Calcula la prioridad de una tarea
   * 
   * Fórmula: P(t) = α·I(t) + β·U(t)
   * 
   * Donde:
   * - I(t) = Importancia = peso_calificacion / 100
   * - U(t) = Urgencia = 1 - (dias_restantes / max_days)
   * - α = 0.6 (peso de importancia)
   * - β = 0.4 (peso de urgencia)
   */
  static calculate(
    pesoCalificacion: number,
    fechaEntrega: Date | string,
    params: PriorityParams = {}
  ): number {
    const alpha = params.alpha ?? this.DEFAULT_ALPHA;
    const beta = params.beta ?? this.DEFAULT_BETA;
    const maxDays = params.maxDays ?? this.DEFAULT_MAX_DAYS;

    // Calcular días restantes
    const diasRestantes = this.getDaysRemaining(fechaEntrega);

    // Importancia: I(t) = peso / 100
    const importancia = pesoCalificacion / 100.0;

    // Urgencia: U(t) = 1 - (min(dias, maxDays) / maxDays)
    const diasParaCalculo = Math.min(Math.max(diasRestantes, 0), maxDays);
    const urgencia = 1.0 - (diasParaCalculo / maxDays);

    // Prioridad: P(t) = α·I(t) + β·U(t)
    const prioridad = (alpha * importancia) + (beta * urgencia);

    // Redondear a 4 decimales
    return Math.round(prioridad * 10000) / 10000;
  }

  /**
   * Determina el nivel de prioridad basado en el score
   */
  static getLevel(priority: number): 'urgent' | 'important' | 'normal' {
    if (priority >= 0.7) return 'urgent';
    if (priority >= 0.4) return 'important';
    return 'normal';
  }

  /**
   * Calcula días restantes hasta la fecha de entrega
   */
  static getDaysRemaining(fechaEntrega: Date | string): number {
    const now = new Date();
    const fecha = typeof fechaEntrega === 'string' ? new Date(fechaEntrega) : fechaEntrega;
    const diffTime = fecha.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcula la importancia (componente I(t))
   */
  static getImportance(pesoCalificacion: number): number {
    return pesoCalificacion / 100.0;
  }

  /**
   * Calcula la urgencia (componente U(t))
   */
  static getUrgency(fechaEntrega: Date | string, maxDays: number = 30): number {
    const diasRestantes = this.getDaysRemaining(fechaEntrega);
    const diasParaCalculo = Math.min(Math.max(diasRestantes, 0), maxDays);
    return 1.0 - (diasParaCalculo / maxDays);
  }
}
