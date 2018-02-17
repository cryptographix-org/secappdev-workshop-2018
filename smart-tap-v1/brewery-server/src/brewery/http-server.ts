import * as express from 'express';
import * as bodyParser from 'body-parser';

/*function listen( tap:SmartTapController, port: number ): any {
  // http/json api from UI
  let tapUI = express();
  tapUI.use(bodyParser.json());

  tapUI.get( '/', (req,res)=> {
    res.sendFile( 'index.html', { root: './public/smart-tap/' } );
  });

  tapUI.use( '/static/vendor', express.static('./public/static/vendor/' ) );

  tapUI.use( '/static', express.static('./public/static/smart-tap/' ) );

  tapUI.get('/info', (req,res) => {
    let info: Object = {
      info: "SmartTAP controller",
      version: "v1",
      name: tap.name,
    };
    if ( tap.keg ) {
      info = {
        ...info,
        keg: {
          id: JSON.stringify( tap.keg.id ),
        }
      }
    }

    res.json( info );
  });

  tapUI.get( '/kegs/:keg_id', (req,res) => {
    console.log( req.params );
    res.json( {} );
  });

  tapUI.post( '/taps/:tap_id', (req,res) => {
    // pour output
    console.log( req.body );
    res.json( {} );
  });

  tapUI.post( '/kegs/:keg_id', (req,res) => {
    // glass sensor update
    console.log( req.body );
    res.json( {} );
  });
  tapUI.post( '/taps/:tap_id', (req,res) => {
      // pour output
      console.log( req.body );
      res.json( {} );
    });

  tapUI.post( '/kegs/:keg_id', (req,res) => {
    // glass sensor update
    console.log( req.body );
    res.json( {} );
  });

  let listenerUI = tapUI.listen( 0xBEEF );

  return listenerUI;
}

export {
  listen
};
*/
