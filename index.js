const express = require('express');
const app = express();
const port = 8008;

app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  const validUrls = urls.filter(url => {
    try {
      new URL(url); // Validate URL syntax
      return true;
    } catch (error) {
      return false;
    }
  });

  if (validUrls.length === 0) {
    return res.status(400).json({ error: 'No valid URLs provided' });
  }

  const fetchOptions = {
    method: 'GET',
    timeout: 500, // Timeout in milliseconds
  };

  try {
    const results = await Promise.allSettled(
      validUrls.map(async url => {
        try {
          const response = await fetch(url, fetchOptions);

          if (response.ok) {
            const jsonData = await response.json();
            if (jsonData.numbers && Array.isArray(jsonData.numbers)) {
              return jsonData.numbers;
            }
          }
        } catch (error) {
          console.log(error);
        }
        return [];
      })
    );

    const allNumbers = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .reduce((acc, numbers) => [...acc, ...numbers], []);

    const uniqueNumbers = Array.from(new Set(allNumbers)).sort((a, b) => a - b);

    res.json({ numbers: uniqueNumbers });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});