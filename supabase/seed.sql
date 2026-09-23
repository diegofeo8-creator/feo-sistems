-- =========================================================
-- DATOS DE PRUEBA — Ejecutar DESPUÉS de schema.sql
-- =========================================================
-- Cómo usar: SQL Editor > New query > pegar todo > Run.
-- Crea 8 productos, 30 etiquetas y 15 casos ficticios
-- (contenido inventado, sin relación con ningún sitio real),
-- para poder probar toda la plataforma con datos reales.
-- =========================================================

-- ---------------------------------------------------------
-- productos
-- ---------------------------------------------------------
insert into productos (name, slug, description) values
  ('Humedad', 'humedad', 'Filtraciones, condensación y moho.'),
  ('Estructura', 'estructura', 'Fisuras, pilares y cimentación.'),
  ('Impermeabilización', 'impermeabilizacion', 'Cubiertas y contenciones.'),
  ('Cubiertas', 'cubiertas', 'Tejados y azoteas.'),
  ('Fachadas', 'fachadas', 'Revestimientos exteriores.'),
  ('Acabados', 'acabados', 'Pavimentos, sanitarios y carpintería.'),
  ('Instalaciones', 'instalaciones', 'Electricidad, fontanería y saneamiento.'),
  ('Aislamiento', 'aislamiento', 'Térmico y acústico.');

-- ---------------------------------------------------------
-- Etiquetas
-- ---------------------------------------------------------
insert into tags (name, slug) values
  ('condensación', 'condensacion'), ('capilaridad', 'capilaridad'),
  ('moho', 'moho'), ('barrera de vapor', 'barrera-de-vapor'),
  ('fisuras', 'fisuras'), ('cimentación', 'cimentacion'),
  ('armadura', 'armadura'), ('corrosión', 'corrosion'),
  ('junta de dilatación', 'junta-de-dilatacion'), ('drenaje', 'drenaje'),
  ('cubierta plana', 'cubierta-plana'), ('sumidero', 'sumidero'),
  ('fachada ventilada', 'fachada-ventilada'), ('anclajes', 'anclajes'),
  ('pavimento', 'pavimento'), ('forjado', 'forjado'),
  ('aislamiento térmico', 'aislamiento-termico'), ('ruido', 'ruido'),
  ('saneamiento', 'saneamiento'), ('normativa CTE', 'normativa-cte'),
  ('impermeabilización', 'impermeabilizacion-tag'), ('muro de contención', 'muro-de-contencion'),
  ('terreno', 'terreno'), ('geotecnia', 'geotecnia'),
  ('hormigón', 'hormigon'), ('coste de reparación', 'coste-de-reparacion'),
  ('obra nueva', 'obra-nueva'), ('mantenimiento', 'mantenimiento'),
  ('inspección técnica', 'inspeccion-tecnica'), ('patologías', 'patologias');

-- ---------------------------------------------------------
-- Casos: Humedad (4)
-- ---------------------------------------------------------
insert into servicios (title, slug, subtitle, excerpt, category_id, content, technical_description, cause, consequences, solution, estimated_cost, published, seo_title, seo_description) values
('Moho oculto tras un revestimiento estanco', 'moho-revestimiento-estanco',
 'Un acabado que no deja transpirar el muro empeora la condensación interior.',
 'Un acabado que no deja transpirar el muro empeora la condensación interior.',
 (select id from productos where slug = 'humedad'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'El revestimiento actúa como barrera de vapor en el lado frío del muro, atrapando la humedad dentro.',
 'Aplicación de un revestimiento impermeable sin considerar el punto de rocío del cerramiento.',
 'Acumulación de humedad interior, aparición de moho y deterioro del acabado desde dentro.',
 'Retirar el revestimiento estanco y sustituirlo por uno transpirable, o resolver la barrera de vapor en el lado correcto.',
 '40-70 €/m² según superficie afectada.',
 true, 'Moho oculto tras un revestimiento estanco', 'Un acabado que no deja transpirar el muro empeora la condensación interior.'),

('Condensación intersticial en cerramiento sin barrera de vapor', 'condensacion-sin-barrera-vapor',
 'El vapor interior atraviesa el muro y condensa dentro del aislamiento.',
 'El vapor interior atraviesa el muro y condensa dentro del aislamiento.',
 (select id from productos where slug = 'humedad'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'Ausencia de barrera de vapor en la cara caliente del aislamiento.',
 'Diseño de cerramiento que no contempló el método de Glaser para verificar condensaciones.',
 'Pérdida de capacidad aislante y aparición de moho dentro del muro.',
 'Incorporar barrera de vapor en la cara caliente del aislamiento.',
 '1-3 €/m² en obra nueva; 80-150 €/m² si ya hay daño.',
 true, 'Condensación intersticial sin barrera de vapor', 'El vapor interior atraviesa el muro y condensa dentro del aislamiento.'),

('Humedad por capilaridad en muro de sótano', 'humedad-capilaridad-sotano',
 'El agua del terreno asciende por los poros del material sin ninguna barrera.',
 'El agua del terreno asciende por los poros del material sin ninguna barrera.',
 (select id from productos where slug = 'humedad'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'Ascenso capilar del agua freática a través de un material poroso.',
 'Ausencia de barrera antihumedad horizontal en el arranque del muro.',
 'Manchas, eflorescencias salinas y degradación progresiva del material.',
 'Inyección de resina hidrofugante o barrera física en el arranque del muro.',
 '60-100 €/ml según técnica empleada.',
 true, 'Humedad por capilaridad en muro de sótano', 'El agua del terreno asciende por los poros del material.'),

('Filtración en junta de hormigonado mal sellada', 'filtracion-junta-hormigonado',
 'Una junta fría entre dos fases de hormigonado sin impermeabilizar.',
 'Una junta fría entre dos fases de hormigonado sin impermeabilizar.',
 (select id from productos where slug = 'humedad'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'La junta de hormigonado no llevó banda de estanqueidad (waterstop).',
 'Fase constructiva sin prever el sellado entre hormigonados no simultáneos.',
 'Entrada de agua freática hacia el interior de la construcción.',
 'Inyección de resina expansiva en la junta desde el interior.',
 '80-120 €/ml.',
 true, 'Filtración en junta de hormigonado', 'Una junta fría sin impermeabilizar entre fases de hormigonado.');

-- ---------------------------------------------------------
-- Casos: Estructura (3)
-- ---------------------------------------------------------
insert into servicios (title, slug, subtitle, excerpt, category_id, content, technical_description, cause, consequences, solution, estimated_cost, published, seo_title, seo_description) values
('Fisura en el encuentro de dos muros de carga', 'fisura-encuentro-muros',
 'Una grieta que nace en la unión de dos muros no es estética: es la señal visible de un movimiento diferencial entre cimentaciones.',
 'Un movimiento diferencial entre cimentaciones deja una grieta que crece con el tiempo.',
 (select id from productos where slug = 'estructura'),
 'En el encuentro entre un muro de carga y un muro de cerramiento aparece una fisura vertical que atraviesa varias hiladas.',
 'Los dos muros apoyan sobre cimentaciones distintas, con cargas y rigideces diferentes, generando un asiento diferencial.',
 'El proyecto no incluyó junta de dilatación en el encuentro entre elementos de distinta rigidez.',
 'La fisura crece con cada ciclo térmico y puede facilitar la entrada de agua hacia la armadura.',
 'Ejecutar una junta de dilatación vertical, sellar con material elástico y reforzar con malla antifisuras.',
 '15-25 €/ml; reparación integral 60-90 €/ml.',
 true, 'Fisura en el encuentro de dos muros de carga', 'Un movimiento diferencial entre cimentaciones deja una grieta que crece.'),

('Grieta en zapata por apoyo irregular', 'grieta-zapata-apoyo-irregular',
 'Un terreno mal compactado bajo la cimentación provoca un asiento diferencial.',
 'Un terreno mal compactado bajo la cimentación provoca un asiento diferencial.',
 (select id from productos where slug = 'estructura'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'Apoyo irregular de la zapata sobre terreno con distinta capacidad portante.',
 'Ausencia de estudio geotécnico previo o incumplimiento de sus recomendaciones.',
 'Asientos diferenciales que se traducen en fisuras estructurales progresivas.',
 'Recalce de la cimentación mediante micropilotes o inyecciones de consolidación.',
 'Variable según técnica de recalce; desde 300 €/punto de recalce.',
 true, 'Grieta en zapata por apoyo irregular', 'Un terreno mal compactado bajo la cimentación provoca un asiento diferencial.'),

('Armadura expuesta por falta de recubrimiento', 'armadura-expuesta-recubrimiento',
 'El hormigón pierde su capa protectora y el acero queda expuesto a la corrosión.',
 'El hormigón pierde su capa protectora y el acero queda expuesto a la corrosión.',
 (select id from productos where slug = 'estructura'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'Recubrimiento de hormigón insuficiente sobre la armadura, según lo exigido por el CTE.',
 'Separadores de armado mal colocados o ausentes durante el hormigonado.',
 'Corrosión acelerada del acero, expansión del óxido y desprendimiento del hormigón.',
 'Picado del hormigón afectado, pasivado de la armadura y reposición con mortero de reparación.',
 '35-60 €/m² de superficie tratada.',
 true, 'Armadura expuesta por falta de recubrimiento', 'El hormigón pierde su capa protectora y el acero queda expuesto.');

-- ---------------------------------------------------------
-- Casos: Impermeabilización (2), Cubiertas (2), Fachadas (2), Acabados (1), Instalaciones (1)
-- ---------------------------------------------------------
insert into servicios (title, slug, subtitle, excerpt, category_id, content, technical_description, cause, consequences, solution, estimated_cost, published, seo_title, seo_description) values
('Filtración bajo el sumidero de una cubierta plana', 'filtracion-sumidero-cubierta',
 'Una lámina mal solapada deja pasar agua hacia el forjado inferior.',
 'Una lámina mal solapada deja pasar agua hacia el forjado inferior.',
 (select id from productos where slug = 'impermeabilizacion'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'Solape insuficiente de la lámina impermeabilizante alrededor del cuerpo del sumidero.',
 'Ejecución sin respetar el solape mínimo indicado por el fabricante del sistema.',
 'Filtración progresiva hacia el forjado inferior con cada lluvia.',
 'Repicar el encuentro y rehacer el solape con el ancho mínimo exigido.',
 '25-40 €/sumidero.',
 true, 'Filtración bajo el sumidero de una cubierta', 'Una lámina mal solapada deja pasar agua hacia el forjado inferior.'),

('Muro de contención sin drenaje trasero', 'muro-contencion-sin-drenaje',
 'El agua se acumula contra el muro en lugar de evacuarse hacia un dren.',
 'El agua se acumula contra el muro en lugar de evacuarse hacia un dren.',
 (select id from productos where slug = 'impermeabilizacion'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'Ausencia de capa drenante y tubo dren tras el trasdós del muro.',
 'Relleno del trasdós sin sistema de drenaje antes del retranqueo.',
 'Sobrepresión hidrostática que puede comprometer la estabilidad del muro.',
 'Excavar el trasdós, instalar geotextil, grava drenante y tubo dren conectado a evacuación.',
 '80-150 €/ml.',
 true, 'Muro de contención sin drenaje trasero', 'El agua se acumula contra el muro en lugar de evacuarse.'),

('Encharcamiento en cubierta plana por pendiente insuficiente', 'encharcamiento-cubierta-pendiente',
 'El agua no llega a los sumideros y queda estancada tras la lluvia.',
 'El agua no llega a los sumideros y queda estancada tras la lluvia.',
 (select id from productos where slug = 'cubiertas'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'Pendiente de formación de cubierta menor al 1,5% recomendado.',
 'Ejecución de la capa de pendiente sin control topográfico adecuado.',
 'Encharcamientos permanentes que aceleran el envejecimiento de la lámina.',
 'Rehacer la capa de pendiente con mortero aligerado hasta alcanzar el porcentaje mínimo.',
 '30-50 €/m².',
 true, 'Encharcamiento en cubierta plana', 'El agua no llega a los sumideros y queda estancada tras la lluvia.'),

('Rebosadero de cubierta sin salida libre', 'rebosadero-cubierta-bloqueado',
 'Un elemento de seguridad bloqueado deja de cumplir su función en lluvia intensa.',
 'Un elemento de seguridad bloqueado deja de cumplir su función en lluvia intensa.',
 (select id from productos where slug = 'cubiertas'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'Rebosadero de seguridad obstruido por hojas y suciedad acumulada.',
 'Falta de mantenimiento periódico de los elementos de evacuación de cubierta.',
 'En lluvia intensa, el agua no tiene salida de emergencia y puede entrar al interior.',
 'Limpieza periódica programada y rejilla de protección contra hojas.',
 '150-300 € instalación de rejillas por cubierta.',
 true, 'Rebosadero de cubierta sin salida libre', 'Un elemento de seguridad bloqueado deja de funcionar en lluvia intensa.'),

('Corrosión en el anclaje de una fachada ventilada', 'corrosion-anclaje-fachada',
 'Un anclaje de acero sin protección adecuada frente a la humedad ambiente.',
 'Un anclaje de acero sin protección adecuada frente a la humedad ambiente.',
 (select id from productos where slug = 'fachadas'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'Uso de acero galvanizado en lugar de acero inoxidable en ambiente húmedo o costero.',
 'Selección de material de anclaje sin considerar la clase de exposición ambiental.',
 'Pérdida de sección resistente del anclaje con riesgo de desprendimiento de placas.',
 'Sustitución de anclajes por acero inoxidable AISI 316 en ambientes agresivos.',
 '12-20 €/anclaje sustituido.',
 true, 'Corrosión en anclaje de fachada ventilada', 'Un anclaje sin protección adecuada frente a la humedad ambiente.'),

('Fisuras por falta de junta de dilatación', 'fisuras-junta-dilatacion',
 'Un paño largo sin juntas acumula tensión térmica hasta agrietarse.',
 'Un paño largo sin juntas acumula tensión térmica hasta agrietarse.',
 (select id from productos where slug = 'fachadas'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'Ausencia de juntas de dilatación cada 6-8 metros en un paño continuo de fachada.',
 'Ejecución sin respetar la distancia máxima entre juntas según el material.',
 'Fisuración distribuida por todo el paño, con posible entrada de agua.',
 'Ejecutar juntas de dilatación verticales y sellarlas con material elástico.',
 '20-35 €/ml de junta ejecutada.',
 true, 'Fisuras por falta de junta de dilatación', 'Un paño largo sin juntas acumula tensión térmica hasta agrietarse.'),

('Pavimento levantado por humedad residual', 'pavimento-levantado-humedad',
 'El forjado no llegó a secarse antes de colocar el suelo laminado.',
 'El forjado no llegó a secarse antes de colocar el suelo laminado.',
 (select id from productos where slug = 'acabados'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'Colocación de pavimento laminado sobre solera con humedad residual superior a la admisible.',
 'No se esperó el tiempo de curado ni se midió la humedad antes de instalar.',
 'Hinchazón y levantamiento de las tablas del pavimento laminado.',
 'Retirar el pavimento, esperar el secado completo verificado con higrómetro, y reinstalar con barrera de vapor.',
 '20-30 €/m² de reinstalación.',
 true, 'Pavimento levantado por humedad residual', 'El forjado no llegó a secarse antes de colocar el suelo laminado.'),

('Ruido de bajante transmitido a la vivienda inferior', 'ruido-bajante-codo',
 'Un codo mal resuelto convierte la caída de agua en un golpe sonoro.',
 'Un codo mal resuelto convierte la caída de agua en un golpe sonoro.',
 (select id from productos where slug = 'instalaciones'),
 'Contenido completo pendiente de redacción desde el panel de administración.',
 'Codo de bajante a 90° que provoca un golpe de ariete audible en las viviendas colindantes.',
 'Diseño de la instalación sin usar codos de 45° combinados ni material fonoabsorbente.',
 'Molestia acústica recurrente cada vez que se usa el desagüe en pisos superiores.',
 'Sustituir por combinación de codos a 45° y forrar el tramo con banda acústica.',
 '150-250 € por intervención puntual.',
 true, 'Ruido de bajante transmitido a la vivienda inferior', 'Un codo mal resuelto convierte la caída de agua en un golpe sonoro.');

-- ---------------------------------------------------------
-- Normativa del caso más desarrollado (ejemplo)
-- ---------------------------------------------------------
insert into regulations (case_id, name, description) values
  ((select id from servicios where slug = 'fisura-encuentro-muros'),
   'CTE DB-SE',
   'Exigencias de seguridad estructural y previsión de movimientos diferenciales.'),
  ((select id from servicios where slug = 'condensacion-sin-barrera-vapor'),
   'CTE DB-HE / CTE DB-HS',
   'Verificación de condensaciones intersticiales y condiciones de salubridad frente a la humedad.');
