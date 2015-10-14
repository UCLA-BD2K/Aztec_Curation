module.exports = {

  writeNewReqs: function(req, toolName, newReqs, finished) {
    var newchange  = [{SPECIAL_REQ: newReqs}, {NAME: toolName}];
    req.getConnection(function(err, connection){
      if (err){
        connection.release();
        finished('Connection error!');
      }
      connection.query(
        'UPDATE TOOL_INFO SET ? WHERE ?',
        newchange,
        function(err, result) {
          if (err){
            connection.release();
            return finished('Transaction error!');
          }

          if(result!=null)
            return finished('Success!');

          return finished('Cannot update!');
      });
    });
  },
  readTestEntry: function(req, toolName, finished) {
    req.getConnection(function(err, connection) {
        if (err){
          connection.release();
          finished('Connection error!');
        }
        connection.query({
        sql: 'SELECT * FROM TOOL_INFO WHERE NAME LIKE ?',
        timeout: 10000

        },
        [toolName],
        function(err, results) {
          if (err) {
            connection.release();
            finished('Query error!');
          }
          var result = JSON.stringify(results[0]);
          if(result==null)
            result = 'Not Found!';
          finished(result);
        });

      });
  },
};
