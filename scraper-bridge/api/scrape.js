const axios = require('axios');
const cheerio = require('cheerio');

async function imageToBase64(url, headers) {
    try {
        const response = await axios.get(url, {
            headers: {
                ...headers,
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            },
            responseType: 'arraybuffer',
            timeout: 10000,
        });

        const contentType = response.headers['content-type'] || 'image/png';
        const base64 = Buffer.from(response.data).toString('base64');
        return `data:${contentType};base64,${base64}`;
    } catch (e) {
        console.error(`Failed to download image: ${url}`, e.message);
        return null;
    }
}

async function inlineImages($, html, headers) {
    if (!html) return html;

    const $fragment = cheerio.load(html, null, false);
    const imgs = $fragment('img').toArray();

    await Promise.all(imgs.map(async (el) => {
        const $el = $fragment(el);
        let src = $el.attr('src');
        if (!src) return;

        if (src.startsWith('/')) {
            src = `https://www.acmicpc.net${src}`;
        }

        if (src.includes('acmicpc.net')) {
            const dataUri = await imageToBase64(src, headers);
            if (dataUri) {
                $el.attr('src', dataUri);
            }
        }
    }));

    return $fragment.html();
}

module.exports = async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Problem ID is required' });
    }

    try {
        // 1. Fetch from BOJ with User-Agent
        const bojUrl = `https://www.acmicpc.net/problem/${id}`;
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://www.acmicpc.net/'
        };

        const response = await axios.get(bojUrl, { headers });
        const html = response.data;
        const $ = cheerio.load(html);

        // 2. Parse HTML
        const title = $('#problem_title').text();
        let description = $('#problem_description').html();
        let inputDescription = $('#problem_input').html();
        let outputDescription = $('#problem_output').html();

        // 3. Convert images in HTML to base64 data URIs
        [description, inputDescription, outputDescription] = await Promise.all([
            inlineImages($, description, headers),
            inlineImages($, inputDescription, headers),
            inlineImages($, outputDescription, headers),
        ]);

        // Extract Test Cases
        const testCases = [];
        let i = 1;
        while (true) {
            const input = $(`#sample-input-${i}`).text().trim();
            const output = $(`#sample-output-${i}`).text().trim();
            if (!input || !output) break;
            testCases.push({ sampleNumber: i, input, expectedOutput: output });
            i++;
        }

        // 4. Fetch Solved.ac Metadata (Optional)
        let tier = 0;
        let category = '';
        try {
            const solvedApiUrl = `https://solved.ac/api/v3/problem/show?problemId=${id}`;
            const solvedRes = await axios.get(solvedApiUrl, { validateStatus: false });
            if (solvedRes.status === 200) {
                tier = solvedRes.data.level;
                if (solvedRes.data.tags) {
                    category = solvedRes.data.tags
                        .map(t => {
                            const koName = t.displayNames.find(n => n.language === 'ko');
                            return koName ? koName.name : t.key;
                        })
                        .join(', ');
                }
            }
        } catch (e) {
            console.error('Failed to fetch solved.ac metadata:', e.message);
        }

        // 5. Return JSON
        res.status(200).json({
            bojId: parseInt(id),
            title,
            tier,
            category,
            description,
            inputDescription,
            outputDescription,
            testCases
        });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        console.error(`Error scraping problem ${id}:`, error.message);
        res.status(500).json({ error: 'Failed to scrape problem', details: error.message });
    }
};
