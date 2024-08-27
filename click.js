const Click = require('@apla/clickhouse');

const clickhouse_host = process.env.CLICKHOUSE_HOST || 'clickhouse';
const clickhouse_port = process.env.CLICKHOUSE_PORT || 8123;
const clickhouse_user = process.env.CLICKHOUSE_USER || false;
const clickhouse_password = process.env.CLICKHOUSE_PASSWORD;
const clickhouse_db = process.env.CLICKHOUSE_DB;

if (!clickhouse_user) {
    console.error('CLICKHOUSE_USER NOT FOUND');
    process.exit(1);
}


const clickhouse = new Click({
    host: clickhouse_host,
    port: clickhouse_port,
    debug: false,
    user: clickhouse_user,
    password: clickhouse_password,
    isUseGzip: false,
    format: "JSONEachRow", // "json" or "csv"
    raw: false,
    config: {
        session_timeout: 360,
        output_format_json_quote_64bit_integers: 0,
        enable_http_compression: 0
    }
});

async function execute_query(query) {
    console.log('query', query);
    return new Promise((resolve, reject) => {
        clickhouse.query(query, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
}

module.exports = {
    execute_query,
    clickhouse
}