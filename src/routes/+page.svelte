<script lang="ts">
	import { CAL_MAP } from '$lib/cals';
</script>

<div class="prose md:mx-auto mx-4">
	<h1 class="text-3xl text-center font-bold">AULE @ UNIBO</h1>
	<p>
		Welcome to the <strong>🚀 Unofficial Classroom Calendar 🚀</strong> for the University of Bologna!
	</p>
	<p>
		Since the University doesn't offer a system to check the availability of classrooms, this
		website was created to assist students in locating <strong>free spaces for studying</strong>.
	</p>
	<p>
		It can also be useful for teachers who need to book a classroom for their lessons, or in general
		to anyone who needs to know the events scheduled in a specific classroom.
	</p>
	<p>
		We <strong>don't scrape</strong> the university's website, but instead rely data provided by the
		university itself via some hidden but <strong>public</strong> APIs.
	</p>
	<p>
		Actually, it's your browser that makes the HTTP requests to the servers, so we're not doing
		anything at all. We're just providing a nice interface. 😼
	</p>

	<hr />

	<div class="md:flex not-prose gap-4">
		<a href="#calendars" class="not-prose btn btn-primary grow max-md:w-full max-md:mb-4">
			Go to calendars 📅
		</a>
		<a href="/aule" class="not-prose btn btn-secondary mx-auto grow max-md:w-full">
			Go to classroom list 📚
		</a>
	</div>

	<hr />

	<p>
		Please note that the API could be changed / removed at any time, so this website could stop
		working without notice. We're not responsible for any inconvenience caused by the unavailability
		of the service.
	</p>

	<p>
		The website is being served on the <a href="https://vercel.com">Vercel</a> free tier and is
		available at: <a href="https://uniboaule.vercel.app/">uniboaule.vercel.app</a>.
	</p>
	<p>
		You can find the source code on <a href="https://github.com/VaiTon/uniboaule/">GitHub</a>.
		Please feel free to inspect, fork, and contribute to the project. Or use it as a base for your
		own project. That's the beauty of open source! 🌈
	</p>
	<hr />
</div>

<h2 class="text-2xl text-center font-bold mt-16 mb-4" id="calendars">Select a calendar</h2>
<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
	{#each CAL_MAP as { id, name }}
		<a href={`/cal/${id}`} class="btn btn-lg btn-border h-auto min-h-15 leading-6 card">{name}</a>
	{/each}
</div>
