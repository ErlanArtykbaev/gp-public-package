export default function handlePayload(field) {
  return (state, { payload }) => ({ ...state, [field]: payload });
}
