'use strict';

const _ = require('lodash');
const Atom = require('./atom');
const utils = require('./utils');
const parser = require('../../../../parser');

class ReferenceAtom extends Atom {
    constructor(constraint, options) {
        super(constraint);
        this.type = 'reference';
        const opts = options || {};
        this.values = [];
        this.pattern = opts.pattern;
        this._options = opts;
        this._matcher = utils.createMatcher(constraint, opts.alias, opts.scope, false);
    }

    assert(fact, fh) {
        try {
            return this._matcher(fact, fh);
        } catch (e) {
            throw new Error(`Error with evaluating pattern ${this.pattern} ${e.message}`);
        }
    }

    merge(that) {
        let ret = this;
        if (that instanceof ReferenceAtom) {
            ret = new this.constructor([this.constraint, that.constraint, 'and'], Object.assign({}, this._options, this._options));
            ret._alias = this._alias || that._alias;
            ret.vars = this.vars.concat(that.vars);
        }
        return ret;
    }

    equal(otherAtom) {
        return otherAtom instanceof this.constructor &&
            _.isEqual(this.constraint, otherAtom.constraint);
    }


    get variables() {
        return this.vars;
    }

    get alias() {
        return this._alias;
    }

    set alias(alias) {
        this._alias = alias;
        this.vars = parser.constraint.getIdentifiers(this.constraint)
            .filter(v => v !== alias);
    }
}

module.exports = ReferenceAtom;