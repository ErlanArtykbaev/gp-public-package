export default obj => obj instanceof Object && (('lhs' in obj) || ('rhs' in obj));
