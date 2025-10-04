// Temporary shim to ensure JSX IntrinsicElements are recognized by the TS language service.
// This relaxes HTML/SVG element typing to "any" to eliminate widespread red underlines.
// If you prefer strict typing, remove this file once React types are properly resolved.
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface IntrinsicAttributes {
    [attr: string]: any;
  }
}
