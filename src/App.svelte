<script>
    import {Router, Route, Link} from "svelte-navigator"
    import Login from "./Login.svelte"
    import Register from "./Register.svelte"
    import Home from "./Home.svelte"
    import Editor from "./Editor.svelte"
    import AddTask from "./AddTask.svelte"
    import Logout from "./Logout.svelte"
    import {
        Collapse,
        Navbar,
        NavbarToggler,
        NavbarBrand,
        Nav,
        NavItem,
        NavLink,
    } from 'sveltestrap';
    import * as store from "./store"
    import * as helpers from "./helpers"
    import NotPublished from "./Publish.svelte"
    import Approve from "./Approve.svelte"

    helpers.setStorage()

    let isOpen = false

    function handleOpen(event) {
        isOpen = event.detail.isOpen
    }

    let username = "", isAdmin = false
    store.username.subscribe(val => {
        username = val
    })
    store.isAdmin.subscribe(val => {
        isAdmin = val
    })
</script>

<Router>
    <Navbar color="light" light expand="md">
        <NavbarBrand>
            <Link to="/">Home</Link>
        </NavbarBrand>
        <NavbarToggler on:click={() => (isOpen = !isOpen)}/>
        <Collapse {isOpen} navbar expand="md" on:update={handleOpen}>
            <Nav class="ms-auto" navbar>

                {#if isAdmin}
                    <NavItem>
                        <NavLink>
                            <Link to="add-task">Add task</Link>
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink>
                            <Link to="approve">Tasks to approve</Link>
                        </NavLink>
                    </NavItem>
                {/if}

                {#if username === ""}
                    <NavItem>
                        <NavLink>
                            <Link to="login">Login</Link>
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink>
                            <Link to="register">Register</Link>
                        </NavLink>
                    </NavItem>
                {:else}
                    <NavItem>
                        <NavLink>
                            <Link to="not-published">Not published</Link>
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink>
                            <Link to="account-settings">Account settings</Link>
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink>
                            <Link to="logout">Logout</Link>
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink style="pointer-events: none;">
                            <div><b>Logged in as {username}</b></div>
                        </NavLink>
                    </NavItem>
                {/if}
            </Nav>
        </Collapse>
    </Navbar>

    <main>
        <Route path="/">
            <Home/>
        </Route>

        <Route path="task/*">
            <Editor/>
        </Route>

        <Route path="login">
            <Login/>
        </Route>

        <Route path="register">
            <Register/>
        </Route>

        <Route path="add-task">
            <AddTask/>
        </Route>

        <Route path="approve">
            <Approve/>
        </Route>

        <Route path="not-published">
            <NotPublished/>
        </Route>

        <Route path="logout">
            <Logout/>
        </Route>

        <Route path="about">
            <h3>About page coming soon</h3>
        </Route>
    </main>
</Router>

<!--<footer>Ján Kelemen 2022</footer>-->

<!--<style lang="scss" global>-->
<!--    @import "./src/styles/global.scss";-->
<!--</style>-->