import {
    Button,
    AppBar,
    Container,
    Toolbar,
    Typography,
    Box,
} from "@mui/material";

function Navbar({
    isAdmin,
    walletConnectFn,
    setAccId,
    accId,
    applyOpen,
    handleApplyClose,
    handleApplyOpen,
    approveOpen,
    handleApproveOpen,
    handApproveClose,
}) {
    return (
        <div>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="/"
                            sx={{
                                mr: 2,
                                display: { xs: "none", md: "flex" },
                                fontFamily: "monospace",
                                fontWeight: 700,
                                letterSpacing: ".3rem",
                                color: "inherit",
                                textDecoration: "none",
                            }}
                        >
                            People's Potluck
                        </Typography>
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: { xs: "none", md: "flex" },
                            }}
                        >
                            <Button
                                key="Apply"
                                onClick={handleApplyOpen}
                                sx={{
                                    my: 2,
                                    color: "white",
                                    display: "block",
                                }}
                            >
                                Apply
                            </Button>
                            {isAdmin ? (
                                <Button
                                    key="Approve"
                                    onClick={handleApproveOpen}
                                    sx={{
                                        my: 2,
                                        color: "white",
                                        display: "block",
                                    }}
                                >
                                    Approve
                                </Button>
                            ) : (
                                <></>
                            )}
                        </Box>
                        <Box sx={{ flexGrow: 0 }}>
                            <Button
                                sx={{
                                    my: 2,
                                    color: "white",
                                    display: "block",
                                }}
                                onClick={() => {
                                    walletConnectFn(setAccId);
                                }}
                            >
                                {accId == 0 ? "Connect" : "Connected"}
                            </Button>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </div>
    );
}

export default Navbar;
