export function calcularUrgencia(
  importance: number,
  complexity: number,
  dueDate: string
): number {
  const diasRestantes = Math.max(
    0,
    Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  )
  const resultado = ((importance * 3) + (complexity * 2)) / (diasRestantes + 1)
  return Math.round(resultado * 10000) / 10000
}

export function urgenciaNivel(urgency: number): string {
  if (urgency >= 5) return 'Muy alta'
  if (urgency >= 4) return 'Alta'
  if (urgency >= 3) return 'Media'
  if (urgency >= 2) return 'Baja'
  return 'Muy baja'
}

export function urgenciaColor(urgency: number): string {
  if (urgency >= 5) return 'Rojo'
  if (urgency >= 4) return 'Naranja'
  if (urgency >= 3) return 'Amarillo'
  if (urgency >= 2) return 'Verde'
  return 'Celeste'
}

export function urgenciaTexto(urgency: number): string {
  if (urgency >= 5) return 'Muy urgente'
  if (urgency >= 4) return 'Urgente'
  if (urgency >= 3) return 'Algo urgente'
  if (urgency >= 2) return 'Poco urgente'
  return 'No muy urgente'
}