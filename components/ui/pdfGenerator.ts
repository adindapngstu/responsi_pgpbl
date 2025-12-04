import { Location, Plan } from '@/types';

export const generateTripHtml = (plan: Plan, locations: Location[]): string => {
    // Urutkan lokasi berdasarkan itinerary
    const sortedLocations = [...locations].sort((a, b) => a.order_index - b.order_index);

    const locationsHtml = sortedLocations.length > 0
        ? sortedLocations.map((loc, index) => `
        <div class="location-item">
          <div class="location-header">
            <span class="location-index">${index + 1}</span>
            <h3>${loc.name}</h3>
          </div>
          <p><strong>Waktu:</strong> ${new Date(loc.visit_date).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          ${loc.notes ? `<p class="notes"><strong>Catatan:</strong> ${loc.notes.replace(/\n/g, '<br>')}</p>` : ''}
        </div>
      `).join('')
        : '<p>Belum ada lokasi yang ditambahkan.</p>';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rencana Perjalanan: ${plan.name}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #2A2A2A;
          margin: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #A8C8FF;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        h1 {
          color: #2A2A2A;
          margin: 0;
        }
        .sub-header {
          color: #555;
          font-size: 1.1em;
        }
        h2 {
          color: #2A2A2A;
          border-bottom: 1px solid #F2F4F7;
          padding-bottom: 5px;
        }
        .location-item {
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #F2F4F7;
          border-radius: 8px;
          background-color: #FCFCFC;
        }
        .location-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .location-index {
          display: inline-block;
          background-color: #A8C8FF;
          color: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          text-align: center;
          line-height: 30px;
          font-weight: bold;
          margin-right: 15px;
        }
        h3 {
          margin: 0;
          flex: 1;
        }
        p {
          margin: 5px 0;
        }
        .notes {
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${plan.name}</h1>
        <p class="sub-header">${new Date(plan.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - ${new Date(plan.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
      <h2>Itinerary</h2>
      ${locationsHtml}
    </body>
    </html>
  `;
};