# CoLab

## Producto

**Aplicación y negocio:** CoLab, alquiler de salas de estudio y trabajo por horas en Valencia.  
**Quién la usa:** estudiantes universitarios y freelancers que se reúnen en grupos de al menos 4 personas.  
**Problema:** las reservas por mensajes no muestran en el momento qué sala está libre ni qué tiene (pizarra, ordenadores, proyector, cafetería, office), y a veces dos grupos quedan en la misma hora.

**Esta versión (en el ordenador del equipo):** ver salas con horario, equipamiento y precio; elegir una franja libre y reservarla a nombre de una persona, con el tamaño del grupo; impedir una segunda reserva de la misma sala y franja; ver la agenda ordenada por días. Cancelar solo es posible si faltan al menos 2 horas: la franja vuelve a quedar libre y el importe figuraría como liberado. Con menos de 2 horas, la cancelación no se admite y la pantalla indica que se cobraría el total. El cobro con tarjeta no es real: no hay banco, retención ni pasarela. Quien abra la página puede reservar y también ver la agenda.

**Más adelante, no en este prototipo:** retención real en tarjeta (se hace efectiva al acceder a la sala), código QR para abrir la puerta, bonos, cuentas y reservas compartidas entre móviles, filtro por cercanía en Valencia, y verificación de identidad para membresías.

## Tecnología

**Prototipo:** una página web con HTML, CSS y JavaScript, sin librerías que instalar. Las reservas se guardan en el navegador y siguen ahí al recargar. Ventaja: se abre pronto y es sencilla de mantener. Limitación: cada móvil guarda su propia agenda; no comparten reservas.

**Posible solución real:** la misma idea de página, publicada en internet. Un programa en un servidor aplica la norma de las dos horas y guarda las reservas en una base de datos común. Un proveedor de pagos retiene y cobra la tarjeta; CoLab no guarda los números. Cuentas, QR, mapa y verificación de identidad se apoyan en ese servidor. Habría que rehacer el almacenamiento. La alternativa de un servidor propio da más control y más mantenimiento. El equipo aún puede corregir si el cobro inicial de una versión real seguiría en recepción.

## Diseño

**Referencias:** composición de la portada de WeWork (barra superior y retícula de espacios; no se copian sus fotos ni sus textos). Letras, botones y color según la ficha de estilo observada en Refero: lienzo `#f7f7f7`, tarjetas `#ffffff`, texto `#222222`, texto secundario `#6a6a6a`, líneas `#ebebeb`, un solo acento `#ff385c` para la acción principal y `#e00b41` al pulsar o en el error. La fuente de esa ficha es propia de otra marca; aquí se usa Segoe UI / system-ui, sin descargarla.

**Dirección:** precisa y sobria. Título de página a 28px y peso 700; secciones a 22px y peso 500; texto a 14px. Botón principal en píldora. Tarjetas a 12px, planas, sin sombra. En móvil las salas pasan a una columna.

**Distintivo:** cada sala es una tarjeta con equipamiento, zona común y precio por hora. Las franjas dicen Libre, Ocupada o Elegida, no solo un color. Reservar es el único botón coral. Cancelar es un botón de contorno oscuro.

## Plan

**Pantallas:** Reservar (salas y franjas) y Agenda (reservas por día, búsqueda por nombre y cancelación).  
**Datos:** en el navegador, clave `colab.reservas.v1`. Cada reserva guarda sala, inicio, nombre, personas y precio. Al recargar siguen ahí.  
**Norma:** una reserva por sala y franja. Cancelar solo si faltan al menos 2 horas; si no, se rechaza y se indica que se cobraría el total. El cobro no es real. El grupo tiene al menos 4 personas. Un formulario incompleto no se guarda.  
**Archivos:** `index.html`, `styles.css`, `app.js`.

## Arranque

Abrir `index.html` en el navegador (doble clic o desde Cursor). No hace falta instalar nada.

## Pendientes

Cobro real en tarjeta, código QR, cuentas, agenda compartida entre móviles, mapa y verificación de identidad. El equipo aún tiene que valorar el diseño al ver la página.
