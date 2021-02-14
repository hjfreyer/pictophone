fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .build_client(false)
        .format(false)
        .compile(
            &["../proto/server/pictophone/v0_1.proto", "../proto/server/pictophone/log.proto"],
            &["../proto/server"],
        )?;

        tonic_build::configure()
        .build_client(false)
        .format(false)
        .compile(
            &["../proto/dolt.proto"],
            &["../proto"],
        )?;
    Ok(())
}
