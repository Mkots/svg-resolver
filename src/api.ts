const API_ENDPOINT = 'https://inputtools.google.com/request?ime=handwriting&app=autodraw&dbg=1&cs=1&oe=UTF-8';
const SVG_ENDPOINT = 'https://storage.googleapis.com/artlab-public.appspot.com/stencils/selman/';


const extractDataFromApi = (data: any): Array<string> => {
    const regex = /SCORESINKS: (.*) Service_Recognize:/
    console.log('Resolve data |>', data);
    return JSON.parse(data[1][0][3].debug_info.match(regex)[1])
}
export const sendDataToIME = async (shapes: Array<any>) => {
    try {
        console.log('Shapes |>', JSON.stringify(shapes));
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                input_type: 0,
                requests: [{
                    language: 'autodraw',
                    writing_guide: {
                        "width": 400,
                        "height": 400
                    },
                    ink: shapes
                }]
            })
        });
        const data = await response.json();

        if (data[0] !== 'SUCCESS') {
            throw new Error(data);
        }

        const results = extractDataFromApi(data);

        const parsedResults = results.map(result => {
            const escapedName = result[0].replace(/ /g, '-');

            return {
                name: result[0],
                confidence: result[1],
                url: `${SVG_ENDPOINT}${escapedName}-01.svg`,
                url_variant_1: `${SVG_ENDPOINT}${escapedName}-02.svg`,
                url_variant_2: `${SVG_ENDPOINT}${escapedName}-03.svg`
            };
        });
        return parsedResults;
    } catch (error) {
        console.log(error);
    }

}
