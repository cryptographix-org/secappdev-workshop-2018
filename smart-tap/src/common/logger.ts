export class Logger {
  static logError( ...str: string[] ) {
    console.log( "ERROR: " + str.join('') );
  }

  static logInfo( ...str: string[] ) {
    console.log( " INFO: " + str.join('') );
  }

  static logDebug( ...str: string[] ) {
    console.log( "DEBUG: " + str.join('') );
  }

}
