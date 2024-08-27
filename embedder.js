const click = require('./click');

async function main() {
    try {
        console.log('clear embedding..');

        await click.execute_query("DROP TABLE IF EXISTS embeddings");
        await click.execute_query(`CREATE TABLE IF NOT EXISTS embeddings (
vendorCode String,
name String,
embeddings Array(Float64)
)
ENGINE = MergeTree
ORDER BY (vendorCode);
`);


        const searchQuery = `
            SELECT
                name, vendorCode
            FROM offers LIMIT 10           
`;

        let results = await click.execute_query(searchQuery);
        results = results.split("\n");

        let insert_embeddings = function () {
            return click.clickhouse.query('INSERT INTO embeddings FORMAT JSONEachRow', (err) => {
                if (err) {
                    console.error(err)
                }
                console.log('Insert complete!')
            });
        }

        let insert_query = insert_embeddings();


        let i = 0;
        for (const e of results) {
            if (e.length < 1) {
                continue;
            }

            i += 1;
            if (i > 3) {
                insert_query.end();
                insert_query = insert_embeddings();
                i = 0;
            }
            let item = JSON.parse(e);

            console.log('embeding.. ', i, item);

            const response = await fetch('http://embedder/embedding', {
                method: "POST",
                body: JSON.stringify({"sentence":item.name}),
                headers: {"Content-Type": "application/json"},
            });
            const body = await response.text();
            const data = JSON.parse(body);

            item.embeddings = data.data.embedding;

            insert_query.write(JSON.stringify(item))
        }

        insert_query.end();

        //let r = await click.execute_query(insertQuery_embeddings);
        //console.log(r);

    } catch (error) {
        console.log('Error', error);
    }
}

main();