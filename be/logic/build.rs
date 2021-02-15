fn main() -> Result<(), Box<dyn std::error::Error>> {
    prost_build::compile_protos(&["../proto/dolt.proto"], &["../proto/"])?;
    prost_build::compile_protos(
        &["../proto/server/pictophone/log.proto"],
        &["../proto/server"],
    )?;

    Ok(())
}
