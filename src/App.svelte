<script>
    import {Link, Route, Router} from "svelte-navigator"
    import Login from "./Login.svelte"
    import Register from "./Register.svelte"
    import Home from "./Home.svelte"
    import Editor from "./Editor.svelte"
    import AddTask from "./AddTask.svelte"
    import Logout from "./Logout.svelte"
    import {
        Collapse,
        Dropdown,
        DropdownItem,
        DropdownMenu,
        DropdownToggle,
        Nav,
        Navbar,
        NavbarBrand,
        NavbarToggler,
        NavItem,
        NavLink,
    } from 'sveltestrap';
    import * as store from "./store"
    import * as helpers from "./helpers"
    import MyTasks from "./MyTasks.svelte"
    import Approve from "./Approve.svelte"
    import About from "./About.svelte";
    import AccountSettings from "./AccountSettings.svelte";
    import PromoteUser from "./PromoteUser.svelte";
    import Statistic from "./Statistic.svelte";
    import ResetPasswordRequest from "./ResetPasswordRequest.svelte";
    import VerifyEmail from "./VerifyEmail.svelte";
    import PasswordReset from "./PasswordReset.svelte";
    import EditTask from "./EditTask.svelte";
    import CodeOfSolution from "./CodeOfSolution.svelte";

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
    <Navbar color="light" light expand="xl">
        <NavbarBrand>
            <img id="navbar-img" height="auto" src="images/logo-navbar.png" class="d-xl-inline d-none"
                 alt="navbar logo">
            <Link to="/"><span class="navbar-home">My bachelor's theses</span></Link>
        </NavbarBrand>
        <NavbarToggler on:click={() => (isOpen = !isOpen)}/>
        <Collapse {isOpen} navbar expand="xl" on:update={handleOpen}>
            <Nav class="ms-auto" navbar>

                {#if username === ""}
                    <NavItem>
                        <NavLink>
                            <Link to="login"><span class="navbar-text">Login</span></Link>
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink>
                            <Link to="register"><span class="navbar-text">Register</span></Link>
                        </NavLink>
                    </NavItem>
                {:else}
                    <NavItem>
                        <NavLink>
                            <Link to="my-tasks"><span class="navbar-text">My tasks</span></Link>
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink>
                            <Link to="account-settings"><span class="navbar-text">Account settings</span></Link>
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink>
                            <Link to="add-task"><span class="navbar-text">Add task</span></Link>
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink>
                            <Link to="logout"><span class="navbar-text">Logout</span></Link>
                        </NavLink>
                    </NavItem>
                {/if}
                <NavItem>
                    <NavLink>
                        <Link to="about"><span class="navbar-text">About</span></Link>
                    </NavLink>
                </NavItem>

                {#if isAdmin}

                    <Dropdown nav inNavbar>
                        <DropdownToggle nav caret>Admin options</DropdownToggle>
                        <DropdownMenu end>

                            <DropdownItem>
                                <Link to="approve"><span class="navbar-text">Tasks for approval</span></Link>
                            </DropdownItem>

                            <DropdownItem>
                                <Link to="promote-user"><span class="navbar-text">Promote user to admin</span>
                                </Link>
                            </DropdownItem>

                        </DropdownMenu>
                    </Dropdown>
                {/if}

            </Nav>
        </Collapse>
    </Navbar>

    <main>
        <Route path="/" primary={false}>
            <Home/>
        </Route>

        <Route path="task/*" primary={false}>
            <Editor/>
        </Route>

        <Route path="login" primary={false}>
            <Login/>
        </Route>

        <Route path="register" primary={false}>
            <Register/>
        </Route>

        <Route path="add-task" primary={false}>
            <AddTask/>
        </Route>

        <Route path="approve" primary={false}>
            <Approve/>
        </Route>

        <Route path="my-tasks" primary={false}>
            <MyTasks/>
        </Route>

        <Route path="logout" primary={false}>
            <Logout/>
        </Route>

        <Route path="about" primary={false}>
            <About/>
        </Route>

        <Route path="account-settings" primary={false}>
            <AccountSettings/>
        </Route>

        <Route path="promote-user" primary={false}>
            <PromoteUser/>
        </Route>

        <Route path="email-verification" primary={false}>
            <VerifyEmail/>
        </Route>

        <Route path="reset-password-request" primary={false}>
            <ResetPasswordRequest/>
        </Route>

        <Route path="password-reset" primary={false}>
            <PasswordReset/>
        </Route>

        <Route path="edit-task" primary={false}>
            <EditTask/>
        </Route>

        <Route path="statistic" primary={false}>
            <Statistic/>
        </Route>

        <Route path="user-solution/*" primary={false}>
            <CodeOfSolution/>
        </Route>
    </main>
</Router>

<style>
    #navbar-img {
        height: auto;
        width: auto;
        max-height: 40px;
    }

    .navbar-text {
        font-size: large;
        font-weight: bold;
        white-space: nowrap;
        color: #0050A0 !important;
    }

    .navbar-home {
        margin-left: 3%;
        font-size: x-large;
        font-weight: bold;
        white-space: nowrap;
        color: #0050A0 !important;
    }

    :global(.navbar-brand) {
        padding: 0px !important;
    }
</style>

<!--<footer>Ján Kelemen 2022</footer>-->
