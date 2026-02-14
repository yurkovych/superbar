import {toast, tl} from './toast.js';

const query = `
	query GetFollowedLive {
		currentUser {
			followedLiveUsers(first: 100) {  
				edges {
					node {
						displayName
						profileImageURL(width: 70)
						stream {
							title
							viewersCount
							game { name }
						}
					}
				}
			}
		}
	}
`;

export async function goGetEm(token) {
	const href = 'https://gql.twitch.tv/gql';

	const request = {
		'method': 'POST',
		'headers': {
			"Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
			"Authorization": "OAuth " + token,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({'query': query})
	};

	const response = await fetch(href, request);
	const parsed = await response.json();
	return parsed;
}