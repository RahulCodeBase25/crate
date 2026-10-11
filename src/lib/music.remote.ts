import { query } from '$app/server';
import * as v from 'valibot';
import { searchTracks } from '#lib/server/itunes.ts';

// A remote function: the browser calls search(q) like a normal async
// function, SvelteKit turns it into a type-safe fetch to the server, and
// valibot checks the input before it reaches Apple's API.
export const search = query(v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(80)), (q) => searchTracks(q, 40));
