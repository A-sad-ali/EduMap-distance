import { Institution } from '../types';

// Declare XLSX globally as it's loaded via CDN
declare const XLSX: any;

export const parseHSSCData = async (file: File): Promise<Institution[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames.find((n: string) => n.toLowerCase().includes('hssc')) || workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const institutions: Institution[] = jsonData
          .map((row: any, index: number) => {
            const lat = parseFloat(row['RTSM_xCord']);
            const lng = parseFloat(row['RTSM_yCord']);
            
            // Basic validation roughly matching Python script bounds
            if (isNaN(lat) || isNaN(lng) || lat < 20 || lat > 40 || lng < 50 || lng > 80) {
              return null;
            }

            let level = (row['SchoolLevel'] || 'unknown').toString().trim().toLowerCase();
            if (level === 'high') level = 'high';
            if (level === 'higher secondary') level = 'higher secondary';

            let gender = (row['Gender'] || 'unknown').toString().trim().toLowerCase();

            return {
              id: `hssc-${index}`,
              name: row['SchoolName'] || 'Unknown School',
              district: row['District'] || '',
              gender,
              level,
              lat,
              lng,
              type: 'HSSC',
              metadata: {
                bemisCode: row['BemisCode'],
                status: row['FunctionalStatus']
              }
            } as Institution;
          })
          .filter((item: Institution | null) => item !== null);
        
        resolve(institutions);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsBinaryString(file);
  });
};

export const parseCollegeData = async (file: File): Promise<Institution[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const institutions: Institution[] = jsonData
          .map((row: any, index: number) => {
            const lat = parseFloat(row['X coordinates']);
            const lng = parseFloat(row['Y coordinates']);

            if (isNaN(lat) || isNaN(lng) || lat < 20 || lat > 40 || lng < 50 || lng > 80) {
              return null;
            }

            let level = (row['Degree/ Inter / University'] || 'unknown').toString().trim().toLowerCase();
            // Normalize levels based on Python script
            if (level.includes('degree')) level = 'degree';
            else if (level.includes('inter')) level = 'inter';
            else if (level.includes('commerce')) level = 'commerce';
            else if (level.includes('physical')) level = 'physical';
            else if (level.includes('post graduate')) level = 'post graduate';

            let gender = (row['Gender'] || 'unknown').toString().trim().toLowerCase();
            if (gender === 'co edu') gender = 'co-edu';

            return {
              id: `col-${index}`,
              name: row['Name of College'] || 'Unknown College',
              district: row['Disrict'] || '', // Note: Python script has typo 'Disrict'
              gender,
              level,
              lat,
              lng,
              type: 'College',
              metadata: {
                tehsil: row['Tahsil'],
                enrollment: row['Enrollment'],
                status: row['Functional / Non Functional']
              }
            } as Institution;
          })
          .filter((item: Institution | null) => item !== null);

        resolve(institutions);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsBinaryString(file);
  });
};