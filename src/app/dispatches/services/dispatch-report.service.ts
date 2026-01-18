// dispatch-report.service.ts o en tu componente

import { Injectable } from '@angular/core';
import {
  DespachoListItem,
  DispatcheListItem,
  DispatcheReport,
} from '../interfaces/dispatches-iterface';
import { ObjetctListItem } from '../../works/interfaces/objects-iterface';


@Injectable({ providedIn: 'root' })
export class DispatchReportService {
  async generateDispatchReport(data: DispatcheListItem[]): Promise<void> {
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    const pdfMake: any = pdfMakeModule.default;
    pdfMake.vfs = pdfFontsModule.default.vfs;

    const headerImage = await this.getBase64ImageFromURL('/header.png');

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1
      ).padStart(2, '0')}/${date.getFullYear()}`;
    };

    // 1. Agrupar por obra+empresa+objeto
    const grouped = new Map<string, DispatcheReport>();

    data.forEach((item) => {
      const key = `${item.obra.codigo}|${item.empresa.codigo}|${item.objeto.codigo}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          obra: item.obra,
          empresa: item.empresa,
          objeto: item.objeto,
          despachos: [],
        });
      }

      grouped.get(key)!.despachos.push(...item.despachos);
    });

    // 2. Consolidar recursos por ID y sumar cantidades
    grouped.forEach((report) => {
      const recursosMap = new Map<number, DespachoListItem>();

      report.despachos.forEach((despacho) => {
        const recursoId = despacho.recurso.id;

        if (recursosMap.has(recursoId)) {
          // Si el recurso ya existe, sumar la cantidad
          recursosMap.get(recursoId)!.cantidadDespachada += despacho.cantidadDespachada;
        } else {
          // Si es nuevo, agregarlo al mapa con su estructura completa
          recursosMap.set(recursoId, {
            id: despacho.id,
            recurso: despacho.recurso,
            cantidadDespachada: despacho.cantidadDespachada
          });
        }
      });

      // Reemplazar el array de despachos con los recursos consolidados
      report.despachos = Array.from(recursosMap.values());
    });

    // 3. Armar el contenido para cada grupo
    const content: any[] = [];

    for (const report of grouped.values()) {
      const objetoTexto = report.objeto
        ? `${report.objeto.codigo} - ${report.objeto.descripcion}`
        : 'N/A';

      content.push(
        {
          image: headerImage,
          width: 500,
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
        {
          text: 'Control de Despachos',
          style: 'header',
          margin: [0, 0, 0, 20],
        },
        {
          columns: [
            {
              text: `Obra: ${report.obra.codigo} - ${report.obra.descripcion}`,
              alignment: 'left',
            },
            {
              text: `Fecha: ${formatDate(new Date().toISOString())}`,
              alignment: 'right',
            },
          ],
          margin: [0, 0, 0, 5],
        },
        {
          text: `Empresa: ${report.empresa.codigo} - ${report.empresa.nombre}`,
          alignment: 'left',
          margin: [0, 0, 0, 5],
        },
        {
          text: `Objeto: ${objetoTexto}`,
          alignment: 'left',
          margin: [0, 0, 0, 15],
        },
        {
          table: {
            widths: ['*', '*', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'U/M', style: 'tableHeader' },
                { text: 'Cantidad', style: 'tableHeader' },
              ],
              ...report.despachos.map((item) => [
                { text: item.recurso.codigo, style: 'tableBody' },
                { text: item.recurso.descripcion, style: 'tableBody' },
                { text: item.recurso.um, style: 'tableBody' },
                { text: item.cantidadDespachada, style: 'tableBody' },
              ]),
            ],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 30],
        },
        { text: '', pageBreak: 'after' }
      );
    }

    // 4. Eliminar el último pageBreak
    if (content.length > 0 && content[content.length - 1].pageBreak) {
      delete content[content.length - 1].pageBreak;
    }

    // 5. Documento
    const docDefinition = {
      content,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          decoration: 'underline',
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        tableHeader: {
          bold: true,
          fillColor: '#eeeeee',
          margin: [0, 5, 0, 5],
        },
        tableBody: {
          margin: [0, 3, 0, 3],
        },
      },
      defaultStyle: {
        fontSize: 10,
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  async generateValeReport(data: any): Promise<void> {
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

    const pdfMake: any = pdfMakeModule.default;
    pdfMake.vfs = pdfFontsModule.default.vfs;

    const headerImage = await this.getBase64ImageFromURL('/header.png');

    const today = new Date();
    const formatDate = (date: Date) =>
      `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1
      ).padStart(2, '0')}/${date.getFullYear()}`;

    const objetoTexto = data.objeto
      ? `${data.objeto.codigo} - ${data.objeto.descripcion}`
      : 'N/A';

    const docDefinition = {
      content: [
        {
          image: headerImage,
          width: 500,
          alignment: 'center',
          margin: [0, 0, 0, 2],
        },
        {
          text: 'Solicitud de Entrega',
          style: 'header',
          margin: [0, 0, 0, 2],
        },

        {
          columns: [
            { text: 'Entidad: UGDC3', style: 'subheader', alignment: 'left' },
          ],
          margin: [0, 0, 0, 10],
        },

        {
          columns: [
            {
              text: `Obra: ${data.obra.codigo} - ${data.obra.descripcion}`,
              alignment: 'left',
            },
            {
              text: `Despacho: ${data.codigo}`,
              alignment: 'right',
              bold: true,
            },
          ],
          margin: [0, 0, 0, 5],
        },

        {
          columns: [
            {
              text: `Empresa: ${data.empresa.codigo} - ${data.empresa.nombre}`,
              alignment: 'left',
            },
            {
              text: `Fecha: ${formatDate(today)}`,
              alignment: 'right',
            },
          ],
          margin: [0, 0, 0, 10],
        },

        {
          text: `Objeto: ${objetoTexto}`,
          alignment: 'left',
          margin: [0, 0, 0, 15],
        },

        {
          table: {
            widths: ['auto', '*', '*', 'auto', 'auto'],
            body: [
              [
                { text: 'No.', style: 'tableHeader' },
                { text: 'Código', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'U/M', style: 'tableHeader' },
                { text: 'Cantidad', style: 'tableHeader' },
              ],
              ...data.despachos.map((item: any, index: number) => [
                { text: index + 1, style: 'tableBody' },
                { text: item.recurso.codigo, style: 'tableBody' },
                { text: item.recurso.descripcion, style: 'tableBody' },
                { text: item.recurso.um, style: 'tableBody' },
                { text: item.cantidadDespachada, style: 'tableBody' },
              ]),
            ],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 30],
        },

        {
          columns: [
            {
              width: '*',
              stack: [
                {
                  text: `SOLICITADO: ${data.empresa.codigo}`,
                  bold: true,
                  margin: [0, 0, 0, 2],
                },
                { text: 'Nombre:', margin: [0, 5, 0, 2] },
                { text: 'Cargo:', margin: [0, 0, 0, 0] },
              ],
              alignment: 'left',
            },
            {
              width: '*',
              stack: [
                {
                  text: 'APROBADO: UGDC3',
                  bold: true,
                  margin: [0, 0, 0, 2],
                },
                { text: 'Nombre:', margin: [0, 5, 0, 2] },
                { text: 'Cargo:', margin: [0, 0, 0, 0] },
              ],
              alignment: 'left',
            },
            {
              width: '*',
              stack: [
                {
                  text: 'RECIBE SOLICITUD',
                  bold: true,
                  margin: [0, 0, 0, 2],
                },
                { text: 'Nombre:', margin: [0, 5, 0, 2] },
                { text: 'Cargo:', margin: [0, 0, 0, 0] },
              ],
              alignment: 'left',
            },
          ],
        },
      ],

      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          decoration: 'underline',
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        tableHeader: {
          bold: true,
          fillColor: '#eeeeee',
          margin: [0, 5, 0, 5],
        },
        tableBody: {
          margin: [0, 3, 0, 3],
        },
      },

      defaultStyle: {
        fontSize: 10,
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  async generateInventoryReport(
    obra: ObjetctListItem,
    data: any[]
  ): Promise<void> {
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

    const pdfMake: any = pdfMakeModule.default;
    pdfMake.vfs = pdfFontsModule.default.vfs;

    const today = new Date();
    const formatDate = (date: Date) =>
      `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1
      ).padStart(2, '0')}/${date.getFullYear()}`;

    const formatDateTime = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${formatDate(date)} ${hours}:${minutes}`;
    };

    // Convertir la imagen del header en base64
    const toBase64 = (url: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        fetch(url)
          .then((res) => res.blob())
          .then((blob) => {
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
          });
      });
    };

    const headerImage = await toBase64('/header.png');

    // Calcular totales
    const totalRecursos = data.length;
    const totalCantidad = data.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    const totalDisponible = data.reduce((sum, item) => sum + (item.disponible || 0), 0);

    const docDefinition = {
      content: [
        {
          image: headerImage,
          width: 500,
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
        {
          text: 'Estado del Inventario',
          style: 'header',
          margin: [0, 0, 0, 10],
        },
        {
          text: `Al ${formatDateTime(today)}`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
        {
          columns: [
            {
              width: '70%',
              text: [
                { text: 'Obra: ', bold: true },
                { text: `${obra.codigo}` }
              ]
            },
            {
              width: '30%',
              text: [
                { text: 'Fecha: ', bold: true },
                { text: formatDate(today) }
              ],
              alignment: 'right'
            }
          ],
          margin: [0, 0, 0, 5],
        },
        {
          text: `${obra.descripcion}`,
          style: 'subheader',
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'U/M', style: 'tableHeader' },
                { text: 'Cantidad', style: 'tableHeader', alignment: 'right' },
                { text: 'Disponible', style: 'tableHeader', alignment: 'right' },
              ],
              ...data.map((item) => [
                { text: item.codigo, style: 'tableBody' },
                { text: item.descripcion, style: 'tableBody' },
                { text: item.um, style: 'tableBody', alignment: 'center' },
                { text: item.cantidad.toFixed(2), style: 'tableBody', alignment: 'right' },
                { text: item.disponible.toFixed(2), style: 'tableBody', alignment: 'right' },
              ]),
              // Fila de totales
              [
                { text: 'TOTAL', style: 'tableTotal', colSpan: 2, alignment: 'right' },
                {},
                { text: `${totalRecursos} recursos`, style: 'tableTotal', alignment: 'center' },
                { text: totalCantidad.toFixed(2), style: 'tableTotal', alignment: 'right' },
                { text: totalDisponible.toFixed(2), style: 'tableTotal', alignment: 'right' },
              ]
            ],
          },
          layout: {
            hLineWidth: function (i: number, node: any) {
              return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5;
            },
            vLineWidth: function () {
              return 0;
            },
            hLineColor: function (i: number, node: any) {
              return (i === 0 || i === 1 || i === node.table.body.length) ? '#000000' : '#cccccc';
            },
            paddingLeft: function () {
              return 8;
            },
            paddingRight: function () {
              return 8;
            },
            paddingTop: function () {
              return 6;
            },
            paddingBottom: function () {
              return 6;
            }
          },
          margin: [0, 0, 0, 20],
        },
        {
          text: [
            { text: 'Nota: ', bold: true },
            { text: 'Este reporte muestra el estado del inventario hasta la fecha y hora indicadas. ' },
            { text: 'La columna "Disponible" refleja la cantidad actual considerando todos los despachos realizados.' }
          ],
          style: 'footer',
          margin: [0, 10, 0, 0],
        }
      ],

      styles: {
        header: {
          fontSize: 20,
          bold: true,
          alignment: 'center',
          color: '#2563eb',
        },
        subheader: {
          fontSize: 12,
          bold: true,
          color: '#1e40af',
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          fillColor: '#3b82f6',
          color: '#ffffff',
          margin: [0, 5, 0, 5],
        },
        tableBody: {
          fontSize: 10,
          margin: [0, 3, 0, 3],
        },
        tableTotal: {
          fontSize: 11,
          bold: true,
          fillColor: '#dbeafe',
          margin: [0, 5, 0, 5],
        },
        footer: {
          fontSize: 9,
          italics: true,
          color: '#6b7280',
        }
      },

      defaultStyle: {
        fontSize: 10,
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  }
}
