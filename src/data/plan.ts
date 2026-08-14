export type Exercise = {
  id: string
  name: string
  target: string // e.g. "3 x 12", "10/10", "20''"
  description: string
}

export type Block = {
  id: string
  title: string
  rounds?: number // e.g. 3 vueltas
  exercises: Exercise[]
}

export type Day = {
  id: 'dia1' | 'dia2' | 'dia3'
  weekday: number // 1 = Monday ... 5 = Friday (JS getDay convention)
  dayLabel: string // "Lunes"
  title: string // "Pierna: Cuádriceps / Glúteo"
  note?: string
  blocks: Block[]
}

export const PLAN_INTRO = {
  title: 'Plan de Entrenamiento',
  subtitle: '3 días por semana — Lunes / Miércoles / Viernes',
  why:
    'Jugás fútbol martes y jueves, y partido el sábado, así que el gimnasio queda limitado a lunes, miércoles y viernes. ' +
    'De esos tres días, el miércoles está encajonado entre dos entrenamientos de fútbol y el viernes es la víspera del ' +
    'partido — por eso la pierna pesada va el lunes (con dos días de recuperación desde el sábado y sin nada exigente al ' +
    'día siguiente), mientras que miércoles y viernes son de tren superior para no comprometer las piernas en los días ' +
    'sensibles. El viernes incluye además un bloque liviano de pierna, de activación y sin llegar al fallo, para no perder ' +
    'estímulo en la semana sin afectar el partido del sábado.',
  goal:
    'Objetivo: ganancia de masa muscular y peso. Trabajá con cargas que te permitan completar las repeticiones indicadas ' +
    'dejando 1-2 repeticiones en reserva (RIR 1-2), no al fallo total, y progresá el peso cuando completes todas las ' +
    'series y repeticiones con buena técnica.',
}

export const PLAN: Day[] = [
  {
    id: 'dia1',
    weekday: 1,
    dayLabel: 'Lunes',
    title: 'Pierna: Cuádriceps / Glúteo',
    blocks: [
      {
        id: 'movilidad',
        title: 'Movilidad',
        exercises: [
          {
            id: 'd1-m1',
            name: 'Sentadilla con banda elástica en rodillas',
            target: '3 x 12',
            description:
              'Banda alrededor de las rodillas, de pie. Bajás en sentadilla empujando las rodillas hacia afuera contra la banda, sin que se cierren hacia adentro. Activa glúteo medio antes de cargar peso.',
          },
          {
            id: 'd1-m2',
            name: 'Zancada con rotación de tronco',
            target: '10/10',
            description:
              'Paso largo hacia adelante. Al bajar, rotás el torso hacia el lado de la pierna adelantada manteniendo el pecho erguido, y volvés al centro al subir.',
          },
          {
            id: 'd1-m3',
            name: 'Movilidad de cadera 90/90',
            target: '10/10',
            description:
              'Sentado en el piso, una pierna doblada adelante a 90° y la otra atrás a 90°. Rotás de un lado al otro llevando ambas rodillas al piso, sin apoyar las manos.',
          },
        ],
      },
      {
        id: 'core',
        title: 'Core',
        rounds: 3,
        exercises: [
          {
            id: 'd1-c1',
            name: 'Elevación de piernas colgado o en banco',
            target: '12',
            description:
              'Colgado de la barra (o apoyado en el banco), subís las piernas rectas o con rodillas flexionadas hasta la altura de la cadera, controlando la bajada sin balancearte.',
          },
          {
            id: 'd1-c2',
            name: 'Russian twist con peso',
            target: '20',
            description:
              'Sentado, torso inclinado hacia atrás y pies apoyados o elevados. Rotás el torso de lado a lado tocando el peso en el piso a cada lado.',
          },
          {
            id: 'd1-c3',
            name: 'Plancha RKC',
            target: "20''",
            description:
              'Plancha estándar pero contrayendo con fuerza glúteos y abdomen, como si quisieras arrastrar los codos hacia los pies sin moverlos. Tensión máxima, por eso el tiempo es corto.',
          },
        ],
      },
      {
        id: 'circuito1',
        title: 'Circuito 1 — Cuádriceps',
        rounds: 3,
        exercises: [
          {
            id: 'd1-1-1',
            name: 'Sentadilla goblet',
            target: '12',
            description:
              'Sostenés una mancuerna o kettlebell pegada al pecho con ambas manos. Bajás en sentadilla profunda manteniendo el torso lo más vertical posible.',
          },
          {
            id: 'd1-1-2',
            name: 'Prensa de piernas',
            target: '12',
            description:
              'En la máquina, pies apoyados a la altura de los hombros. Bajás controlado hasta 90° de rodilla sin despegar la zona lumbar del respaldo.',
          },
          {
            id: 'd1-1-3',
            name: 'Zancada caminando con mancuernas',
            target: '10/10',
            description:
              'Mancuernas a los costados del cuerpo. Das pasos largos alternando piernas, con la rodilla de atrás bajando casi hasta tocar el piso.',
          },
        ],
      },
      {
        id: 'circuito2',
        title: 'Circuito 2 — Glúteo',
        rounds: 3,
        exercises: [
          {
            id: 'd1-2-1',
            name: 'Peso muerto rumano con barra',
            target: '10',
            description:
              'Barra pegada a las piernas, rodillas apenas flexionadas y fijas. Bajás empujando la cadera hacia atrás hasta sentir el estiramiento en isquiotibiales, y volvés extendiendo la cadera.',
          },
          {
            id: 'd1-2-2',
            name: 'Hip thrust con barra',
            target: '12',
            description:
              'Espalda alta apoyada en un banco, barra apoyada sobre la cadera. Empujás la cadera hacia arriba hasta la extensión completa, apretando el glúteo arriba antes de bajar.',
          },
          {
            id: 'd1-2-3',
            name: 'Abducción de cadera en polea',
            target: '12/12',
            description:
              'Manopla en el tobillo, polea baja. Llevás la pierna hacia afuera del cuerpo de forma controlada, y volvés resistiendo el regreso.',
          },
        ],
      },
      {
        id: 'circuito3',
        title: 'Circuito 3 — Pantorrilla / Estabilidad',
        rounds: 3,
        exercises: [
          {
            id: 'd1-3-1',
            name: 'Elevación de talones en prensa o multipower',
            target: '15',
            description:
              'Subís en puntas de pie lo más alto posible y bajás controlado hasta sentir el estiramiento en la pantorrilla antes de repetir.',
          },
          {
            id: 'd1-3-2',
            name: 'Sentadilla isométrica en pared',
            target: "30''",
            description:
              'Espalda apoyada contra la pared, bajás hasta que la rodilla forme 90° y sostenés la posición estática ese tiempo.',
          },
        ],
      },
    ],
  },
  {
    id: 'dia2',
    weekday: 3,
    dayLabel: 'Miércoles',
    title: 'Empuje: Pecho / Hombro / Tríceps',
    blocks: [
      {
        id: 'movilidad',
        title: 'Movilidad',
        exercises: [
          {
            id: 'd2-m1',
            name: 'Rotación de hombros con bastón',
            target: '15',
            description:
              'Sostenés un bastón o palo con ambas manos, más ancho que los hombros, y hacés círculos amplios llevándolo de adelante hacia atrás por encima de la cabeza.',
          },
          {
            id: 'd2-m2',
            name: 'Movilidad de muñeca y antebrazo',
            target: '10',
            description:
              'Rotás y flexionás las muñecas en todas las direcciones para preparar la articulación antes de empujar cargas.',
          },
          {
            id: 'd2-m3',
            name: 'Estiramiento dinámico de pectoral en marco de puerta',
            target: '10',
            description:
              'Apoyás el antebrazo en el marco de una puerta y das un paso adelante estirando el pecho, en movimiento continuo de entrada y salida, no sostenido.',
          },
        ],
      },
      {
        id: 'core',
        title: 'Core',
        rounds: 3,
        exercises: [
          {
            id: 'd2-c1',
            name: 'Rueda abdominal (ab wheel)',
            target: '10',
            description:
              'De rodillas, sostenés la rueda con ambas manos y la rodás hacia adelante extendiendo el cuerpo lo más posible sin arquear la zona lumbar, y volvés contrayendo el abdomen.',
          },
          {
            id: 'd2-c2',
            name: 'Plancha con toque de mano contraria',
            target: '20',
            description:
              'En plancha alta (brazos extendidos), levantás una mano y tocás el hombro contrario, alternando sin que la cadera se mueva de lado a lado.',
          },
          {
            id: 'd2-c3',
            name: 'Plancha lateral con elevación de cadera',
            target: '10/10',
            description:
              'En plancha lateral, bajás y subís la cadera en pulsos cortos manteniendo el cuerpo alineado, sin rotar el torso.',
          },
        ],
      },
      {
        id: 'circuito1',
        title: 'Circuito 1 — Pecho',
        rounds: 3,
        exercises: [
          {
            id: 'd2-1-1',
            name: 'Press inclinado con mancuernas',
            target: '10',
            description:
              'Banco a 30-45°. Bajás las mancuernas a la altura del pecho con control y empujás hacia arriba sin chocarlas entre sí.',
          },
          {
            id: 'd2-1-2',
            name: 'Cruce de poleas (crossover)',
            target: '15',
            description:
              'Poleas altas, un pie adelante para estabilidad. Llevás los brazos hacia adelante y abajo, cruzando frente al cuerpo y apretando el pecho al final.',
          },
          {
            id: 'd2-1-3',
            name: 'Flexiones con lastre o déficit',
            target: '12',
            description:
              'Flexión de brazos clásica, sumando peso extra en la espalda (mochila o disco) o elevando las manos sobre soportes para mayor rango de movimiento.',
          },
        ],
      },
      {
        id: 'circuito2',
        title: 'Circuito 2 — Hombro',
        rounds: 3,
        exercises: [
          {
            id: 'd2-2-1',
            name: 'Press militar con barra',
            target: '10',
            description:
              'De pie o sentado, barra a la altura de los hombros. Empujás hacia arriba hasta extender los brazos, sin arquear en exceso la zona lumbar.',
          },
          {
            id: 'd2-2-2',
            name: 'Elevación lateral en polea',
            target: '15/15',
            description:
              'Polea baja al costado del cuerpo. Elevás el brazo lateralmente hasta la altura del hombro con una leve flexión de codo, controlando la bajada.',
          },
          {
            id: 'd2-2-3',
            name: 'Face pull',
            target: '15',
            description:
              'Polea a la altura de la cara con cuerda. Tirás hacia la cara separando las manos y llevando los codos altos — trabaja el deltoides posterior y la salud del hombro.',
          },
        ],
      },
      {
        id: 'circuito3',
        title: 'Circuito 3 — Tríceps',
        rounds: 3,
        exercises: [
          {
            id: 'd2-3-1',
            name: 'Press francés con barra o mancuernas',
            target: '12',
            description:
              'Acostado o sentado, bajás el peso detrás o hacia la cabeza flexionando solo el codo (el brazo se mantiene fijo), y extendés de vuelta.',
          },
          {
            id: 'd2-3-2',
            name: 'Patada de tríceps con mancuerna',
            target: '12/12',
            description:
              'Torso inclinado hacia adelante, codo pegado al cuerpo y fijo. Extendés el antebrazo hacia atrás hasta que el brazo quede recto.',
          },
          {
            id: 'd2-3-3',
            name: 'Extensión en polea con cuerda',
            target: '15',
            description:
              'De pie frente a la polea alta, codos pegados al cuerpo. Extendés hacia abajo separando la cuerda al final del movimiento.',
          },
        ],
      },
    ],
  },
  {
    id: 'dia3',
    weekday: 5,
    dayLabel: 'Viernes',
    title: 'Tirón: Espalda / Bíceps + accesorio de pierna',
    note:
      'El bloque de pierna al final es de activación, con carga liviana y lejos del fallo — el objetivo es mantener el ' +
      'estímulo semanal sin fatigar las piernas antes del partido del sábado.',
    blocks: [
      {
        id: 'movilidad',
        title: 'Movilidad',
        exercises: [
          {
            id: 'd3-m1',
            name: 'Deslizamiento escapular en pared (wall slides)',
            target: '12',
            description:
              'Espalda y brazos apoyados en la pared formando una "W". Deslizás los brazos hacia arriba manteniendo el contacto con la pared todo el recorrido.',
          },
          {
            id: 'd3-m2',
            name: 'Rotación externa con banda, codo a 90°',
            target: '15',
            description:
              'Codo pegado al cuerpo y fijo a 90°. Rotás el antebrazo hacia afuera contra la resistencia de la banda, y volvés controlado.',
          },
          {
            id: 'd3-m3',
            name: 'Cat-cow dinámico',
            target: '10',
            description:
              'En cuadrupedia, alternás entre arquear la espalda hacia arriba (gato) y hundirla hacia abajo (vaca), de forma controlada y continua.',
          },
        ],
      },
      {
        id: 'core',
        title: 'Core',
        rounds: 3,
        exercises: [
          {
            id: 'd3-c1',
            name: 'Pallof press',
            target: '12/12',
            description:
              'De pie, de costado a una polea. Sostenés la cuerda frente al pecho y extendés los brazos hacia adelante resistiendo que el torso rote hacia la polea.',
          },
          {
            id: 'd3-c2',
            name: 'Superman alternado',
            target: '15',
            description:
              'Acostado boca abajo, elevás brazo y pierna contraria al mismo tiempo, alternando de lado sin balancear el cuerpo.',
          },
          {
            id: 'd3-c3',
            name: 'Bird dog',
            target: '12/12',
            description:
              'En cuadrupedia, extendés brazo y pierna contraria manteniendo la cadera estable y sin rotar, alternando de lado.',
          },
        ],
      },
      {
        id: 'circuito1',
        title: 'Circuito 1 — Espalda',
        rounds: 3,
        exercises: [
          {
            id: 'd3-1-1',
            name: 'Dominadas asistidas o jalón al pecho agarre ancho',
            target: '10',
            description:
              'Tirás del cuerpo (o de la barra) hacia el pecho llevando los codos hacia abajo y atrás, apretando los omóplatos al final.',
          },
          {
            id: 'd3-1-2',
            name: 'Remo en máquina',
            target: '12',
            description:
              'Sentado, pecho apoyado si la máquina lo permite. Tirás de las manijas hacia el torso apretando los omóplatos al final del recorrido.',
          },
          {
            id: 'd3-1-3',
            name: 'Remo con mancuerna a dos manos apoyado en banco',
            target: '12',
            description:
              'Torso apoyado sobre un banco inclinado, mancuernas colgando. Tirás de ambas hacia la cadera llevando los codos hacia atrás.',
          },
        ],
      },
      {
        id: 'circuito2',
        title: 'Circuito 2 — Bíceps',
        rounds: 3,
        exercises: [
          {
            id: 'd3-2-1',
            name: 'Curl martillo con mancuernas',
            target: '12',
            description:
              'Agarre neutro, palmas enfrentadas. Flexionás el codo sin rotar la muñeca — trabaja también el antebrazo.',
          },
          {
            id: 'd3-2-2',
            name: 'Curl en banco Scott',
            target: '10',
            description:
              'Brazos apoyados sobre el banco inclinado. Flexionás el codo controlando también la bajada, sin despegar el brazo del apoyo.',
          },
          {
            id: 'd3-2-3',
            name: 'Curl en polea baja',
            target: '15',
            description: 'De pie frente a la polea baja, codo fijo pegado al costado del cuerpo. Flexionás controlando todo el recorrido.',
          },
        ],
      },
      {
        id: 'circuito3',
        title: 'Circuito 3 — Accesorio de pierna',
        rounds: 3,
        exercises: [
          {
            id: 'd3-3-1',
            name: 'Puente de glúteo a una pierna en banco',
            target: '10/10',
            description:
              'Espalda alta apoyada en el banco, una pierna extendida o apoyada en el aire. Empujás la cadera hacia arriba solo con la pierna de apoyo.',
          },
          {
            id: 'd3-3-2',
            name: 'Curl femoral en máquina o fitball',
            target: '12',
            description:
              'Acostado boca abajo (o con los talones sobre un fitball), flexionás la rodilla llevando el talón hacia el glúteo contra resistencia.',
          },
          {
            id: 'd3-3-3',
            name: 'Clamshell con banda',
            target: '15/15',
            description:
              'Acostado de costado, rodillas flexionadas y banda por encima de las rodillas. Abrís la rodilla superior como una almeja, sin mover la cadera.',
          },
        ],
      },
    ],
  },
]

export function findExerciseById(id: string): Exercise | undefined {
  for (const day of PLAN) {
    for (const block of day.blocks) {
      const ex = block.exercises.find((e) => e.id === id)
      if (ex) return ex
    }
  }
  return undefined
}

export function getDayByWeekday(weekday: number): Day | undefined {
  return PLAN.find((d) => d.weekday === weekday)
}
