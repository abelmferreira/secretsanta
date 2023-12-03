var SecretSanta = function () {

    this.names = [];

    this.enforced = Object.create( null );
    this.blacklists = Object.create( null );
    this.picked = [];
};


SecretSanta.prototype.add = function ( name ) {

    if ( this.names.indexOf( name ) !== -1 )
        throw new Error( 'Cannot redefine ' + name );

    this.names.push( name );

    var subapi = { };

    subapi.enforce = function ( other ) {

        this.enforced[ name ] = other;

        return subapi;

    }.bind( this );

    subapi.blacklist = function ( other ) {

        if ( ! Object.prototype.hasOwnProperty.call( this.blacklists, name ) )
            this.blacklists[ name ] = [];

        if ( this.blacklists[ name ].indexOf( other ) === -1 )
            this.blacklists[ name ].push( other );

        return subapi;

    }.bind( this );

    return subapi;

};

SecretSanta.prototype.generate = function () {

    var pairings = Object.create( null );
    var candidatePairings = Object.create( null );

    this.names.forEach( function ( name ) {

        if ( Object.prototype.hasOwnProperty.call( this.enforced, name ) ) {

            var enforced = this.enforced[ name ];

            if ( this.names.indexOf( enforced ) === -1 )
                throw new Error( name + ' foi forçado a combinar com ' + enforced + ', no qual não existe na lista de nomes declarados' );

            Object.keys( pairings ).forEach( function ( name ) {

                if ( pairings[ name ] === enforced ) {
                    throw new Error( 'De acordo com suas regras, multiplas pessoas foram combinadas com ' + enforced );
                }

            } );

            candidatePairings[ name ] = [ this.enforced[ name ] ];

        } else {

            var candidates = _.difference( this.names, [ name ] );

            if ( Object.prototype.hasOwnProperty.call( this.blacklists, name ) )
                candidates = _.difference( candidates, this.blacklists[ name ] );

            candidatePairings[ name ] = candidates;

        }

    }, this );

    var pickOutPairing = function (name) {
        if ( candidatePairings[ name ].length === 0 )
            throw new Error('Não conseguimos sortear um par para ' + name + '! Pressione sortear novamente para recomeçar e se o erro persistir, revise suas regras de exclusão ou combinação');

        // Remove already picked candidate from the potential candidates
        var picked = this.picked;
        var potentialCandidate = candidatePairings[ name ].filter( function ( name ) { return !picked.includes(name); } );

        if (potentialCandidate.length == 0) {
            var pairing = _.sample( candidatePairings[ name ] );
        } else {
            var pairing = _.sample( potentialCandidate );
        }

        delete candidatePairings[ name ];

        Object.keys( candidatePairings ).forEach( function ( name ) {
            candidatePairings[ name ] = _.without( candidatePairings[ name ], pairing );
        } );

        pairings[ name ] = pairing;
        
        if (this.picked.length == 0 ) {
            this.picked.push(name);
            this.picked.push(pairing);
        } else {
            this.picked.push(pairing);
        }

        return pairing

    }.bind( this );
    
    let picked = ''
    Object.keys(candidatePairings).forEach(name => {
        if ( Object.keys(pairings).length == 0) {
            picked = pickOutPairing(name)
        } else {
            picked = pickOutPairing(picked)
        }
    })

    return pairings;
};
