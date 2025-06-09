// dispatch-report.service.ts o en tu componente

import { Injectable } from '@angular/core';
import {
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

    // 2. Armar el contenido para cada grupo
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
              ...report.despachos.map((item, index) => [
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

    // 3. Eliminar el último pageBreak
    if (content.length > 0 && content[content.length - 1].pageBreak) {
      delete content[content.length - 1].pageBreak;
    }

    // 4. Documento
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

    const docDefinition = {
      content: [
        {
          image: headerImage,
          width: 500,
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
        {
          text: 'Control de Inventario',
          style: 'header',
          margin: [0, 0, 0, 20],
        },
        {
          text: `Obra: ${obra.codigo} - ${obra.descripcion}`,
          alignment: 'left',
        },
        {
          text: `Fecha de reporte: ${formatDate(today)}`,
          alignment: 'right',
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            widths: ['auto', '*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'U/M', style: 'tableHeader' },
                { text: 'Cantidad', style: 'tableHeader' },
                { text: 'Disponible', style: 'tableHeader' },
              ],
              ...data.map((item) => [
                { text: item.codigo, style: 'tableBody' },
                { text: item.descripcion, style: 'tableBody' },
                { text: item.um, style: 'tableBody' },
                { text: item.cantidad, style: 'tableBody' },
                { text: item.disponible, style: 'tableBody' },
              ]),
            ],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 30],
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
